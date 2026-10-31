const urls = [
  "http://localhost:3000",
  "http://localhost:3000/studio/user-dna-database",
];

const results = [];
for (const url of urls) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": "FragranceDNA-Healthcheck/1.0",
      },
    });

    results.push({ url, status: res.status, ok: res.ok });
  } catch (error) {
    results.push({
      url,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
