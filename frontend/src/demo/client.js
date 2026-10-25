import {
  clone,
  loadDemoDb,
  persistDemoDb,
  presentListing,
  presentOffer,
} from "./store";

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function httpError(status, data) {
  const error = new Error(data.error || "Request failed");
  error.response = { status, data };
  return error;
}

function pathOf(url) {
  return String(url || "").split("?")[0].replace(/\/$/, "") || "/";
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });
  return missing;
}

function simulatePayment(db, jobId) {
  const offer = db.offers.find((row) => String(row.id) === String(jobId));
  if (!offer) {
    throw httpError(404, { error: "Job was not found in the demo." });
  }
  if (offer.state === "complete") {
    throw httpError(409, { error: "This job is already paid." });
  }

  offer.state = "complete";
  const presented = presentOffer(db, offer);
  const total =
    presented.pay_per_hour * presented.hours_per_day * presented.num_days;
  const safeTotal = Number.isFinite(total) ? total : 0;
  const cents = String(Math.round(safeTotal * 100));
  const employer = presented.employer_name || "Employer";
  const employee = presented.employee_name || "Worker";

  return {
    simulated: true,
    success: true,
    message: "Simulated Open Payments transfer completed.",
    jobId: presented.id,
    amount: {
      currency: "ZAR",
      assetCode: "ZAR",
      assetScale: 2,
      value: cents,
      display: `R${safeTotal}`,
    },
    sendingWallet: { label: `${employer} demo wallet` },
    receivingWallet: { label: `${employee} demo wallet` },
    steps: [
      { name: "Incoming-payment grant", status: "granted" },
      {
        name: "Incoming payment",
        status: "created",
        id: `demo-incoming-${presented.id}`,
      },
      { name: "Quote grant", status: "granted" },
      {
        name: "ILP quote",
        status: "created",
        id: `demo-quote-${presented.id}`,
      },
      {
        name: "Outgoing-payment grant",
        status: "finalized",
        note: "Interaction approved in the simulated wallet.",
      },
      {
        name: "Outgoing payment",
        status: "completed",
        id: `demo-outgoing-${presented.id}`,
      },
    ],
  };
}

function handle(method, url, body) {
  const path = pathOf(url);
  const db = loadDemoDb();
  const payload = body || {};

  if (method === "GET" && path === "/get_all_available_listings") {
    return clone(db.listings.map((row) => presentListing(db, row)));
  }

  if (method === "GET" && path === "/get_all_offer_listings") {
    return clone(db.offers.map((row) => presentOffer(db, row)));
  }

  if (method === "POST" && path === "/add_job_listing") {
    const missing = requireFields(payload, [
      "job_type",
      "location",
      "pay_per_hour",
    ]);
    if (missing.length) {
      throw httpError(400, {
        error: "Job type, location, and pay per hour are required.",
      });
    }
    const id = db.nextId++;
    db.listings.push({
      id,
      job_type: payload.job_type,
      location: payload.location,
      pay_per_hour: Number(payload.pay_per_hour),
      applicant_id: null,
    });
    persistDemoDb(db);
    return { id };
  }

  if (method === "POST" && path === "/add_job_listing_offer") {
    const id = db.nextId++;
    db.offers.push({
      id,
      job_type: payload.job_type,
      location: payload.location,
      pay_per_hour: Number(payload.pay_per_hour),
      address: payload.address,
      start_date: payload.start_date,
      hours_per_day: Number(payload.hours_per_day),
      num_days: Number(payload.num_days),
      job_description: payload.job_description,
      state: "offered",
      applicant_id: payload.applicant_id || null,
      customer_id: payload.customer_id || null,
    });
    persistDemoDb(db);
    return { message: "Job listing added successfully", id };
  }

  if (method === "POST" && path === "/accept_offer") {
    const offer = db.offers.find((row) => String(row.id) === String(payload.id));
    if (!offer) {
      throw httpError(404, { error: "Offer was not found in the demo." });
    }
    offer.state = "ongoing";
    persistDemoDb(db);
    return {
      success: true,
      message: "Offer accepted. The job is now ongoing.",
    };
  }

  if (method === "POST" && path === "/reject_offer") {
    const before = db.offers.length;
    db.offers = db.offers.filter((row) => String(row.id) !== String(payload.id));
    if (db.offers.length === before) {
      throw httpError(404, { error: "Offer was not found in the demo." });
    }
    persistDemoDb(db);
    return {
      message: `Job offer with ID ${payload.id} rejected and removed.`,
    };
  }

  if (method === "POST" && path === "/make_payments") {
    const result = simulatePayment(db, payload.jobId);
    persistDemoDb(db);
    return result;
  }

  throw httpError(404, { error: `No demo handler for ${method} ${path}` });
}

export const demoClient = {
  async get(url) {
    await wait(120);
    return { data: handle("GET", url) };
  },
  async post(url, body) {
    const path = pathOf(url);
    await wait(path === "/make_payments" ? 700 : 160);
    return { data: handle("POST", url, body) };
  },
};
