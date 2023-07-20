## AWSFIS-Run-Network-Latency

- Interface: The interface to add delay to (default: eth0).
- DelayMilliseconds: The delay - in milliseconds - to add to the interface (default: 200).
- DurationSeconds: (Required) The duration - in seconds - of the test.
- InstallDependencies: If set to True, Systems Manager installs the required dependencies on the target instances. (default: True).

```json
{
  "Interface": "ens5",
  "DelayMilliseconds": "400",
  "DurationSeconds": "120",
  "InstallDependencies": "True"
}
```

## AWSFIS-Run-Network-Latency-Sources

- Interface: The interface to add delay to (default: eth0).
- DelayMilliseconds: The delay - in milliseconds - to add to the interface (default: 200).
- JitterMilliseconds: The jitter - in milliseconds - to add to the delay (default: 10).
- Sources: (Required) Specify a comma separated list of sources to add delay to (Supported: IPv4, IPv4/CIDR, Domain name, DYNAMODB|S3) - e.g. "DYNAMODB,www.example.com,72.21.198.64/32,72.21.198.67".
- TrafficType: The type of traffic to delay (default: ingress).
- DurationSeconds: (Required) The duration - in seconds - of the test.
- InstallDependencies: If set to True, Systems Manager installs the required dependencies on the target instances. (default: True).

```json
{
  "Interface": "ens5",
  "DelayMilliseconds": "400",
  "JitterMilliseconds": "50",
  "Sources": "3.80.16.0/23",
  "TrafficType": "ingress",
  "DurationSeconds": "120",
  "InstallDependencies": "True"
}
```

## AWSFIS-Run-Network-Packet-Loss

- Interface: The interface to add loss to (default: eth0).
- LossPercent: The percent of packet loss (default: 7).
- DurationSeconds: (Required) The duration - in seconds - of the fault injection.
- InstallDependencies: If set to True, Systems Manager installs the required dependencies on the target instances. (default: True)

```json
{
  "Interface": "ens5",
  "LossPercent": "10",
  "DurationSeconds": "120",
  "InstallDependencies": "True"
}
```

## AWSFIS-Run-Network-Packet-Loss-Sources

- Interface: The interface to add packet loss to (default: eth0).
- LossPercent: The percent of packet loss (default: 7).
- Sources: (Required) Specify a comma separated list of sources to add packet loss to (Supported: IPv4, IPv4/CIDR, Domain name, DYNAMODB|S3) - e.g. "DYNAMODB,www.example.com,72.21.198.64/32,72.21.198.67".
- TrafficType: The type of traffic to affect (default: ingress).
- DurationSeconds: (Required) The duration - in seconds - of the test.
- InstallDependencies: If set to True, Systems Manager installs the required dependencies on the target instances. (default: True).

```json
{
  "Interface": "ens5",
  "LossPercent": "10",
  "Sources": "3.80.16.0/23",
  "TrafficType": "ingress",
  "DurationSeconds": "120",
  "InstallDependencies": "True"
}
```
