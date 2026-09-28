"""Linux network namespace and virtual interface lifecycle management."""

import logging
import subprocess
from typing import List, Optional
from services.testbed.src.network.topology import InterfaceSpec, TopologySpec, get_default_topology

logger = logging.getLogger("abhedyax.testbed.network")


class NetworkNamespaceManager:
    """Safely manages Linux network namespaces, veth interfaces, and routing for testbed."""

    def __init__(self, topology: Optional[TopologySpec] = None):
        self.topology = topology or get_default_topology()
        self.active_namespaces: List[str] = []

    def _run_cmd(self, cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Execute system command safely using argument array with timeout."""
        logger.debug("Executing network command: %s", " ".join(cmd))
        try:
            return subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10,
                check=check,
            )
        except subprocess.CalledProcessError as e:
            logger.error("Command '%s' failed: %s", " ".join(cmd), e.stderr)
            raise

    def is_namespace_exists(self, ns_name: str) -> bool:
        """Check if a network namespace exists."""
        try:
            res = subprocess.run(["ip", "netns", "list"], capture_output=True, text=True, timeout=5)
            for line in res.stdout.splitlines():
                if line.split()[0] == ns_name:
                    return True
            return False
        except Exception:
            return False

    def create_topology(self) -> None:
        """Provision all testbed namespaces, veth links, addresses, and isolated forwarding."""
        namespaces = [
            self.topology.initiator.name,
            self.topology.router.name,
            self.topology.responder.name,
        ]

        logger.info("Provisioning testbed namespaces: %s", namespaces)

        try:
            # 1. Create namespaces
            for ns in namespaces:
                if not self.is_namespace_exists(ns):
                    self._run_cmd(["ip", "netns", "add", ns])
                    self.active_namespaces.append(ns)
                # Bring up loopback
                self._run_cmd(["ip", "netns", "exec", ns, "ip", "link", "set", "lo", "up"])

            # 2. Link initiator <-> router
            self._create_veth_pair(
                ns_a=self.topology.initiator.name,
                if_a=self.topology.initiator.interfaces[0].name,
                ip4_a=self.topology.initiator.interfaces[0].ip4,
                ip6_a=self.topology.initiator.interfaces[0].ip6,
                ns_b=self.topology.router.name,
                if_b=self.topology.initiator.interfaces[0].peer_name,
                ip4_b=self.topology.router.interfaces[0].ip4,
                ip6_b=self.topology.router.interfaces[0].ip6,
            )

            # 3. Link router <-> responder
            self._create_veth_pair(
                ns_a=self.topology.router.name,
                if_a=self.topology.router.interfaces[1].name,
                ip4_a=self.topology.router.interfaces[1].ip4,
                ip6_a=self.topology.router.interfaces[1].ip6,
                ns_b=self.topology.responder.name,
                if_b=self.topology.responder.interfaces[0].name,
                ip4_b=self.topology.responder.interfaces[0].ip4,
                ip6_b=self.topology.responder.interfaces[0].ip6,
            )

            # 4. Set default routes
            self._run_cmd([
                "ip", "netns", "exec", self.topology.initiator.name,
                "ip", "route", "add", "default", "via", self.topology.initiator.default_gateway_v4,
            ])
            self._run_cmd([
                "ip", "netns", "exec", self.topology.responder.name,
                "ip", "route", "add", "default", "via", self.topology.responder.default_gateway_v4,
            ])

            # 5. Enable IP forwarding strictly inside router namespace ONLY
            self._run_cmd([
                "ip", "netns", "exec", self.topology.router.name,
                "sysctl", "-w", "net.ipv4.ip_forward=1",
            ])
            self._run_cmd([
                "ip", "netns", "exec", self.topology.router.name,
                "sysctl", "-w", "net.ipv6.conf.all.forwarding=1",
            ])

            logger.info("Testbed network topology successfully established")

        except Exception as e:
            logger.error("Topology creation failed: %s; rolling back", e)
            self.cleanup()
            raise

    def _create_veth_pair(
        self,
        ns_a: str,
        if_a: str,
        ip4_a: str,
        ip6_a: str,
        ns_b: str,
        if_b: str,
        ip4_b: str,
        ip6_b: str,
    ) -> None:
        """Create and place a virtual ethernet pair between two namespaces."""
        # Create in default ns then move, or create directly inside ns_a
        tmp_a = f"{if_a}_tmp"
        tmp_b = f"{if_b}_tmp"

        self._run_cmd(["ip", "link", "add", tmp_a, "type", "veth", "peer", "name", tmp_b])
        self._run_cmd(["ip", "link", "set", tmp_a, "netns", ns_a, "name", if_a])
        self._run_cmd(["ip", "link", "set", tmp_b, "netns", ns_b, "name", if_b])

        # Assign IPs and bring up A
        self._run_cmd(["ip", "netns", "exec", ns_a, "ip", "addr", "add", ip4_a, "dev", if_a])
        self._run_cmd(["ip", "netns", "exec", ns_a, "ip", "-6", "addr", "add", ip6_a, "dev", if_a])
        self._run_cmd(["ip", "netns", "exec", ns_a, "ip", "link", "set", if_a, "up"])

        # Assign IPs and bring up B
        self._run_cmd(["ip", "netns", "exec", ns_b, "ip", "addr", "add", ip4_b, "dev", if_b])
        self._run_cmd(["ip", "netns", "exec", ns_b, "ip", "-6", "addr", "add", ip6_b, "dev", if_b])
        self._run_cmd(["ip", "netns", "exec", ns_b, "ip", "link", "set", if_b, "up"])

    def cleanup(self) -> None:
        """Idempotently destroy testbed namespaces and release virtual interfaces."""
        namespaces = [
            self.topology.initiator.name,
            self.topology.router.name,
            self.topology.responder.name,
        ]

        for ns in namespaces:
            try:
                if self.is_namespace_exists(ns):
                    logger.info("Cleaning up namespace: %s", ns)
                    self._run_cmd(["ip", "netns", "del", ns], check=False)
            except Exception as e:
                logger.warning("Failed to delete namespace %s: %s", ns, e)

        self.active_namespaces.clear()
