const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/check-single-image-url.mjs <url>");
  process.exit(1);
}

try {
  const response = await fetch(url, {
    headers: {
      "user-agent": "FragranceDNA-ImageCheck/1.0",
    },
  });

  console.log(JSON.stringify({ url, status: response.status, ok: response.ok }, null, 2));
} catch (error) {
  console.log(
    JSON.stringify(
      {
        url,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
