"""Command-line interface for AbhedyaX strongSwan Testbed."""

import asyncio
import json
import sys
from typing import Optional
import click
from services.testbed.src.capture.manager import CaptureManager
from services.testbed.src.config.settings import PATHS
from services.testbed.src.ground_truth.generator import generate_ground_truth
from services.testbed.src.network.namespace import NetworkNamespaceManager
from services.testbed.src.network.prerequisites import evaluate_testbed_environment
from services.testbed.src.orchestrator import testbed_orchestrator
from services.testbed.src.scenarios.loader import load_all_scenarios
from services.testbed.src.scenarios.presets import list_preset_scenarios
from services.testbed.src.traffic.generators import ControlledTrafficGenerator
from services.testbed.src.traffic.profiles import TRAFFIC_PROFILES, TrafficClass


@click.group()
def cli():
    """AbhedyaX Controlled strongSwan IPsec Testbed CLI."""
    pass


@cli.command("check")
def check_cmd():
    """Verify testbed host prerequisites and capability readiness."""
    status = evaluate_testbed_environment()
    click.echo("==================================================")
    click.echo(" AbhedyaX Testbed Prerequisite Verification")
    click.echo("==================================================")
    click.echo(f"  Linux OS Detected:         {'[OK]' if status.is_linux else '[FAIL]'}")
    click.echo(f"  Root Privileges:           {'[OK]' if status.has_root else '[WARN] Non-root'}")
    click.echo(f"  Linux Network Namespaces:  {'[OK]' if status.can_manage_netns else '[WARN] Unavailable without root'}")
    click.echo(f"  strongSwan (charon/swanctl):{'[OK]' if status.has_strongswan else '[WARN] Not found'}")
    if status.strongswan_version:
        click.echo(f"    Version: {status.strongswan_version}")
    click.echo(f"  tcpdump Packet Capture:    {'[OK]' if status.has_tcpdump else '[WARN] Not found'}")
    if status.tcpdump_version:
        click.echo(f"    Version: {status.tcpdump_version}")
    click.echo(f"  TShark Protocol Dissector: {'[OK]' if status.has_tshark else '[WARN] Not found'}")
    if status.tshark_version:
        click.echo(f"    Version: {status.tshark_version}")
    click.echo("--------------------------------------------------")
    click.echo(f"  Default Operational Mode:  {status.default_mode.upper()}")
    click.echo(f"  Status Summary:            {status.message}")
    click.echo("==================================================")


@cli.command("list")
def list_cmd():
    """List all available testbed scenario definitions."""
    scenarios = load_all_scenarios()
    click.echo(f"Found {len(scenarios)} defined testbed scenarios:\n")
    click.echo(f"{'ID':<22} {'IKE':<7} {'CIPHER':<15} {'DH GROUP':<13} {'RISK':<9} {'NAME'}")
    click.echo("-" * 80)
    for sc in scenarios.values():
        click.echo(
            f"{sc.scenario_id:<22} {sc.ike_version:<7} {sc.encryption:<15} {sc.dh_group:<13} {sc.expected_security.risk_level:<9} {sc.name}"
        )


@cli.command("run")
@click.argument("scenario_id")
@click.option("--mode", type=click.Choice(["simulation", "real"]), default=None, help="Execution mode")
@click.option(
    "--traffic",
    type=click.Choice(["ICMP", "Web", "Email", "VoIP", "Video", "Messaging"]),
    default="ICMP",
    help="Traffic profile",
)
def run_cmd(scenario_id: str, mode: Optional[str], traffic: str):
    """Execute a testbed scenario end-to-end."""
    async def _do_run():
        click.echo(f"Initiating testbed run for scenario '{scenario_id}' (traffic={traffic})...")
        run = await testbed_orchestrator.start_run(
            scenario_id=scenario_id,
            traffic_profile=traffic,  # type: ignore
            execution_mode=mode,  # type: ignore
        )
        click.echo(f"Run ID: {run.run_id} | Execution Mode: {run.execution_mode.upper()}")

        # Poll status
        last_state = ""
        while True:
            await asyncio.sleep(0.3)
            current = testbed_orchestrator.get_run(run.run_id)
            if not current:
                break
            if current.state != last_state:
                click.echo(f"  [{current.progress:>3}%] {current.state:<20} - {current.step_description}")
                last_state = current.state

            if current.state in ["Completed", "Failed", "Cancelled"]:
                break

        current = testbed_orchestrator.get_run(run.run_id)
        if current and current.state == "Completed":
            click.echo("\nTestbed Run Successful!")
            if current.capture_metadata:
                click.echo(f"  PCAP File:     {current.capture_metadata.capture_file}")
                click.echo(f"  Packet Count:  {current.capture_metadata.packet_count}")
            if current.ground_truth:
                click.echo(f"  Ground Truth:  {current.scenario_id}")
            if current.validation_result:
                click.echo(f"  Accuracy:      {int(current.validation_result.accuracy * 100)}%")
                click.echo(f"  Checks:        {current.validation_result.matched_checks}/{current.validation_result.total_checks} passed")
        elif current and current.state == "Failed":
            click.echo(f"\nRun Failed: {current.error_message}", err=True)
            sys.exit(1)

    asyncio.run(_do_run())


@cli.command("capture")
@click.argument("scenario_id")
@click.option("--traffic", default="ICMP", type=click.Choice(list(TRAFFIC_PROFILES.keys())))
def capture_cmd(scenario_id: str, traffic: str):
    """Generate packet capture and ground-truth metadata for a scenario."""
    scenarios = load_all_scenarios()
    if scenario_id not in scenarios:
        click.echo(f"Error: Unknown scenario '{scenario_id}'", err=True)
        sys.exit(1)

    scenario = scenarios[scenario_id]
    click.echo(f"Generating capture for scenario '{scenario_id}'...")

    async def _do_capture():
        run_id = f"cap-{scenario_id[:6]}"
        cap_mgr = CaptureManager(scenario=scenario, run_id=run_id, traffic_profile=traffic, is_simulation=True)
        cap_mgr.start_capture()
        traffic_gen = ControlledTrafficGenerator(profile_name=traffic)  # type: ignore
        record = await traffic_gen.run(duration_seconds=0.5, is_simulation=True)
        meta = cap_mgr.stop_capture(traffic_packets=record.packets_transmitted)
        gt = generate_ground_truth(scenario=scenario, traffic_record=record, capture_metadata=meta)
        click.echo(f"Capture generated: {meta.capture_file} ({meta.packet_count} packets)")
        click.echo(f"Ground truth written: {PATHS.generated_ground_truth_dir}/{scenario.scenario_id}_{meta.run_id}.json")

    asyncio.run(_do_capture())


@cli.command("validate")
@click.argument("run_id")
def validate_cmd(run_id: str):
    """View validation results for a completed run."""
    run = testbed_orchestrator.get_run(run_id)
    if not run:
        # Check generated directory for persisted report
        matches = list(PATHS.generated_analysis_dir.glob(f"*_{run_id}_validation.json"))
        if matches:
            with open(matches[0], "r", encoding="utf-8") as f:
                data = json.load(f)
            click.echo(json.dumps(data, indent=2))
            return
        click.echo(f"Run ID '{run_id}' not found", err=True)
        sys.exit(1)

    if not run.validation_result:
        click.echo(f"No validation result available for run '{run_id}' (State: {run.state})")
        return

    res = run.validation_result
    click.echo(f"Validation Report for Run {run_id} ({res.scenario_id}):")
    click.echo(f"  Passed:   {'YES' if res.passed else 'NO'}")
    click.echo(f"  Accuracy: {int(res.accuracy * 100)}% ({res.matched_checks}/{res.total_checks} checks matched)")
    click.echo("-" * 60)
    for c in res.checks:
        status_sym = "[x]" if c.match else "[ ]"
        click.echo(f"  {status_sym} {c.field:<20} Expected: {str(c.expected):<15} Observed: {str(c.observed)}")


@cli.command("cleanup")
def cleanup_cmd():
    """Safely tear down testbed network namespaces and release interfaces."""
    click.echo("Cleaning up testbed namespaces and virtual interfaces...")
    mgr = NetworkNamespaceManager()
    mgr.cleanup()
    click.echo("Cleanup completed.")


@cli.command("dataset-generate")
@click.option("--limit", type=int, default=None, help="Limit number of generated dataset captures")
def dataset_generate_cmd(limit: Optional[int]):
    """Generate the benchmark matrix of labelled IPsec captures and ground-truth records."""
    from services.testbed.src.dataset_generator import generate_dataset

    async def _do_gen():
        click.echo("Generating labelled IPsec PCAP dataset matrix...")
        manifest = await generate_dataset(limit=limit, is_simulation=True)
        click.echo(f"\nGenerated {manifest.total_samples} labelled dataset samples!")
        click.echo(f"Manifest written to: {PATHS.base_dir / 'generated' / 'dataset_manifest.json'}")

    asyncio.run(_do_gen())


if __name__ == "__main__":
    cli()
