# AbhedyaX Testbed Network Safety and Isolation Policy

## 1. Safety Principles

The AbhedyaX testbed was developed following cybersecurity best practices to ensure zero disruption to host machines and public networks:

1. **Strictly Sandboxed Traffic**: All generated packets (ICMP, HTTP, TCP bursts, UDP streams) are directed strictly between `192.168.10.2` and `192.168.20.2` through isolated virtual ethernet pairs.
2. **Zero Public WAN Ingress/Egress**: The testbed never transmits packets across host physical interfaces (`eth0`, `wlan0`, etc.) and never contacts external IP addresses or DNS resolvers.
3. **No Host Route Pollution**: Routing entries are placed strictly within target network namespaces (`ip netns exec ns_initiator ip route add ...`). Host routing tables are completely untouched.
4. **Isolated IP Forwarding**: Kernel forwarding (`sysctl -w net.ipv4.ip_forward=1`) is enabled strictly within `ns_router`, never host-wide.
5. **Deterministic Cleanup**: All network namespaces, virtual interfaces, strongSwan processes, and temporary files are automatically deleted upon run completion or failure via strict `finally` and signal handlers.
6. **Subprocess Security**: Commands are invoked using strict argument arrays without shell interpolation (`shell=False`) and bound by configurable execution timeouts.
7. **Key Protection**: Pre-shared keys and credentials are generated randomly per run or bound to isolated local identifiers; private keys are never exposed in public API responses.
