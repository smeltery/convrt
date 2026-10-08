# Self-hosted API deployment

This configuration runs one API instance with persistent jobs and a local
HTTP gateway. Set `CONVRT_API_KEYS` through your shell or secret manager to one
or more comma-separated random secrets of at least 32 characters.

From the repository root:

```sh
docker compose -f deploy/api/compose.yaml config --quiet
docker compose -f deploy/api/compose.yaml up --build -d
curl http://127.0.0.1:8787/health
```

The gateway binds only to loopback. Set `CONVRT_PORT` to change its default
port of 8787. Add a trusted TLS reverse proxy before
remote access. Do not expose the conversion container directly. The conversion
network is internal; only the gateway joins the externally connected network.
See [Docker network documentation](https://docs.docker.com/compose/how-tos/networking/#internal-networks).

## Storage and restart

The `jobs` volume holds the SQLite journal and uploaded/converted files. Keep
one API instance per volume. Queued jobs resume on restart; completed outputs
remain downloadable until expiration. Interrupted jobs report an explicit
failure. API keys must remain stable so callers retain access to their jobs.

```sh
docker compose -f deploy/api/compose.yaml restart api
docker compose -f deploy/api/compose.yaml down
```

`down` preserves the volume. Adding `--volumes` permanently deletes retained
jobs and uploaded/converted files. Back up the volume only while the API is
stopped, and protect backups as private user data.

## Resource limits

The API runs as an unprivileged user with a read-only root filesystem, dropped
capabilities, no privilege escalation, two CPU cores, 2 GiB memory, and a process
limit. Temporary storage is capped at 256 MiB. The durable volume needs an
operator-managed disk quota; Docker named volumes are not automatically bounded.
Proxy access logging is disabled. Do not add request-body logging.

This is a deployment for a trusted operator, not a multi-tenant codec sandbox.
All jobs share a container and data volume. For untrusted public uploads, use
separate restricted workers with per-job filesystem access, enforce customer
quotas, and arrange TLS and API-key rotation. See [API behavior](../../docs/api/README.md).

The `API container` workflow builds this configuration, converts a fixture over
HTTP, restarts the API, and verifies the retained download before removing the
test volume. Runtime validation needs Docker Engine; `config --quiet` alone
checks configuration syntax, not successful startup.
