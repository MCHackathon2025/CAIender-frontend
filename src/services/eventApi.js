// src/services/eventApi.js
const API_URL = "https://86hofs0dtf.execute-api.ap-east-2.amazonaws.com/Prod/graphql";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFjZjk1N2Y3LTE4OGEtNDJiNy04NzdmLWQ2OWYwZGE3YzM2YSIsImlhdCI6MTc1ODM3MTg3MCwiZXhwIjoxNzU4NDU4MjcwfQ.WwKxY4eGxqS864r1LPaWVCv77q6ph21L5JssHQWQMMs"; // 記得換成你的 token

// 查 me → 拿到所有 eventId
export async function fetchMyEvents() {
  const query = `
    query {
      me {
        events { eventId }
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-token": TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.me.events || [];
}

// 查單一 event
export async function fetchEvent(eventId) {
  const query = `
    query($input: GetEventInput!) {
      getEvent(input: $input) {
        eventId
        title
        description
        startTime
        endTime
        type
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-token": TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: { input: { eventId } },
    }),
  });
  const json = await res.json();
  return json.data.getEvent;
}

// 一次拿所有 events (排序)
export async function fetchAllEvents() {
  const basicEvents = await fetchMyEvents();
  const fullEvents = await Promise.all(basicEvents.map(e => fetchEvent(e.eventId)));
  return fullEvents
    .filter(Boolean)
    .sort((a, b) => {
      if (a.startTime === b.startTime) {
        return new Date(a.endTime) - new Date(b.endTime);
      }
      return new Date(a.startTime) - new Date(b.startTime);
    });
}
