export const sdkExample = `import { Convrt } from "@convrt/sdk";

const client = new Convrt({
  baseUrl: process.env.CONVRT_API_URL!,
  apiKey: process.env.CONVRT_API_KEY!,
});

const file = new File(
  [await Bun.file("photo.png").arrayBuffer()],
  "photo.png",
);
const output = await client.convert(file, "webp", { quality: 80 });
await Bun.write("photo.webp", output);`

export const uploadExample = `curl "$CONVRT_API_URL/v1/jobs" \\
  -H "Authorization: Bearer $CONVRT_API_KEY" \\
  -F "file=@photo.png" \\
  -F "to=webp" \\
  -F 'options={"quality":80}'`

export const dockerExample = `# From the convrt repository root:
export CONVRT_API_KEYS="$(openssl rand -hex 32)"
docker compose -f deploy/api/compose.yaml up --build -d

export CONVRT_API_URL="http://127.0.0.1:8787"
export CONVRT_API_KEY="$CONVRT_API_KEYS"`

export const endpoints = [
  {
    id: 'create-job',
    method: 'POST',
    title: 'Create a job',
    path: '/v1/jobs',
    description:
      'Upload one file and queue a conversion. Send multipart fields file, to, and optional options (a JSON object). The response is HTTP 202 with the job ID and a Location header.',
    example: uploadExample,
  },
  {
    id: 'get-job',
    method: 'GET',
    title: 'Get a job',
    path: '/v1/jobs/{id}',
    description:
      'Poll a job owned by your API key. Status is queued, running, succeeded, or failed. Completed jobs include a relative downloadUrl; failed jobs include an error.',
    example: `curl "$CONVRT_API_URL/v1/jobs/$JOB_ID" \\
  -H "Authorization: Bearer $CONVRT_API_KEY"`,
  },
  {
    id: 'download',
    method: 'GET',
    title: 'Download output',
    path: '/v1/jobs/{id}/download',
    description:
      'Download the converted bytes after the job succeeds. This route requires the same bearer token. An unfinished or failed job returns HTTP 409.',
    example: `curl "$CONVRT_API_URL/v1/jobs/$JOB_ID/download" \\
  -H "Authorization: Bearer $CONVRT_API_KEY" \\
  --output photo.webp`,
  },
  {
    id: 'delete-job',
    method: 'DELETE',
    title: 'Delete a job',
    path: '/v1/jobs/{id}',
    description:
      'Remove a queued or completed job and its files. Success returns HTTP 204. A running conversion cannot be deleted and returns HTTP 409.',
    example: `curl -X DELETE "$CONVRT_API_URL/v1/jobs/$JOB_ID" \\
  -H "Authorization: Bearer $CONVRT_API_KEY"`,
  },
  {
    id: 'formats',
    method: 'GET',
    title: 'List formats',
    path: '/v1/formats',
    description:
      'Return the format catalog. Authentication is required. Available conversion routes depend on engines and codecs installed on your server.',
    example: `curl "$CONVRT_API_URL/v1/formats" \\
  -H "Authorization: Bearer $CONVRT_API_KEY"`,
  },
]
