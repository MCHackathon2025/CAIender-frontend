// src/services/weatherApi.js
export async function fetchWeather(region = "Hsinchu", time = null) {
  let input = `region: "${region}"`;
  if (time) input += `, time: "${time}"`;

  const query = `
    query {
      getWeather(input: { ${input} }) {
        humidity
        temperature
        time
        region
      }
    }
  `;

  // Call Vite proxy's /api/graphql
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error("GraphQL Error:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data.getWeather;
}
