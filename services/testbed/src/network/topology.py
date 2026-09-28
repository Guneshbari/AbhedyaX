"""Network topology definitions for isolated multi-endpoint VPN testbed."""

from typing import Dict, List
from pydantic import BaseModel, Field


class InterfaceSpec(BaseModel):
    name: str
    ip4: str
    ip6: str
    peer_name: str
    peer_ns: str


class NamespaceSpec(BaseModel):
    name: str
    role: str
    description: str
    interfaces: List[InterfaceSpec] = Field(default_factory=list)
    protected_subnet_v4: str
    protected_subnet_v6: str
    default_gateway_v4: str
    default_gateway_v6: str


class TopologySpec(BaseModel):
    """Network topology containing initiator, intermediary router, and responder namespaces."""

    initiator: NamespaceSpec
    router: NamespaceSpec
    responder: NamespaceSpec
    protected_subnets_v4: List[str]
    protected_subnets_v6: List[str]


def get_default_topology() -> TopologySpec:
    """Return canonical 3-node network topology specification."""
    return TopologySpec(
        initiator=NamespaceSpec(
            name="ns_initiator",
            role="VPN Client (Initiator)",
            description="Client endpoint originating IPsec Security Association proposals and user application traffic.",
            interfaces=[
                InterfaceSpec(
                    name="veth_init",
                    ip4="192.168.10.2/24",
                    ip6="fd00:10::2/64",
                    peer_name="veth_r_init",
                    peer_ns="ns_router",
                )
            ],
            protected_subnet_v4="10.100.1.0/24",
            protected_subnet_v6="fd00:100:1::/64",
            default_gateway_v4="192.168.10.1",
            default_gateway_v6="fd00:10::1",
        ),
        router=NamespaceSpec(
            name="ns_router",
            role="Transit Gateway / Router",
            description="Intermediate IP forwarder simulating untrusted WAN infrastructure and packet capture point.",
            interfaces=[
                InterfaceSpec(
                    name="veth_r_init",
                    ip4="192.168.10.1/24",
                    ip6="fd00:10::1/64",
                    peer_name="veth_init",
                    peer_ns="ns_initiator",
                ),
                InterfaceSpec(
                    name="veth_r_resp",
                    ip4="192.168.20.1/24",
                    ip6="fd00:20::1/64",
                    peer_name="veth_resp",
                    peer_ns="ns_responder",
                ),
            ],
            protected_subnet_v4="0.0.0.0/0",
            protected_subnet_v6="::/0",
            default_gateway_v4="",
            default_gateway_v6="",
        ),
        responder=NamespaceSpec(
            name="ns_responder",
            role="VPN Gateway (Responder)",
            description="Corporate VPN gateway accepting IKE proposals, authenticating peers, and terminating ESP tunnels.",
            interfaces=[
                InterfaceSpec(
                    name="veth_resp",
                    ip4="192.168.20.2/24",
                    ip6="fd00:20::2/64",
                    peer_name="veth_r_resp",
                    peer_ns="ns_router",
                )
            ],
            protected_subnet_v4="10.100.2.0/24",
            protected_subnet_v6="fd00:100:2::/64",
            default_gateway_v4="192.168.20.1",
            default_gateway_v6="fd00:20::1",
        ),
        protected_subnets_v4=["10.100.1.0/24", "10.100.2.0/24"],
        protected_subnets_v6=["fd00:100:1::/64", "fd00:100:2::/64"],
    )
