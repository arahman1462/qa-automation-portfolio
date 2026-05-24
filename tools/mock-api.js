const http = require("http");

const port = Number(process.env.MOCK_API_PORT || 4010);

const users = [
  "George Bluth",
  "Janet Weaver",
  "Emma Wong",
  "Eve Holt",
  "Charles Morris",
  "Tracey Ramos",
  "Michael Lawson",
  "Lindsay Ferguson",
  "Tobias Funke",
  "Byron Fields",
  "George Edwards",
  "Rachel Howell",
].map((name, index) => {
  const [firstName, lastName] = name.split(" ");
  const id = index + 1;

  return {
    id,
    email: `${firstName}.${lastName}@example.test`.toLowerCase(),
    first_name: firstName,
    last_name: lastName,
    avatar: `https://cdn.example.test/users/${id}.jpg`,
  };
});

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function paginatedUsers(page) {
  const perPage = 6;
  const start = (page - 1) * perPage;

  return {
    page,
    per_page: perPage,
    total: users.length,
    total_pages: Math.ceil(users.length / perPage),
    data: users.slice(start, start + perPage),
  };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const method = request.method;

  if (method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (method === "GET" && url.pathname === "/api/users") {
    const page = Number(url.searchParams.get("page") || 1);
    sendJson(response, 200, paginatedUsers(page));
    return;
  }

  const userMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
  if (userMatch && method === "GET") {
    const user = users.find((candidate) => candidate.id === Number(userMatch[1]));

    if (!user) {
      sendJson(response, 404, {});
      return;
    }

    sendJson(response, 200, {
      data: user,
      support: {
        url: "https://example.test/support",
        text: "Mock API support content",
      },
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/users") {
    const payload = await readBody(request);
    sendJson(response, 201, {
      ...payload,
      id: String(users.length + 1),
      createdAt: new Date().toISOString(),
    });
    return;
  }

  if (userMatch && method === "PUT") {
    const payload = await readBody(request);
    sendJson(response, 200, {
      ...payload,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (userMatch && method === "DELETE") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (method === "POST" && url.pathname === "/api/login") {
    const payload = await readBody(request);

    if (!payload.password) {
      sendJson(response, 400, { error: "Missing password" });
      return;
    }

    sendJson(response, 200, { token: "mock-session-token" });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`);
});
