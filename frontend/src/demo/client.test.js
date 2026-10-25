import { demoClient } from "./client";
import { clearDemoData, listPeople } from "./store";

beforeEach(() => {
  clearDemoData();
});

test("seeds listings, employers, employees, and matches without an API", async () => {
  const listings = await demoClient.get("/get_all_available_listings");
  const offers = await demoClient.get("/get_all_offer_listings");
  const people = listPeople();

  expect(listings.data.map((job) => job.employee_name)).toEqual([
    "Sipho Dlamini",
    "Ayesha Patel",
    "Lerato Mokoena",
  ]);
  expect(people.employers.map((person) => person.name)).toEqual([
    "Thandi Nkosi",
    "Johan van Wyk",
    "Priya Naidoo",
  ]);
  expect(people.employees).toHaveLength(3);
  expect(offers.data.map((offer) => offer.state)).toEqual([
    "offered",
    "ongoing",
    "offered",
  ]);
  expect(offers.data[1].employer_name).toBe("Thandi Nkosi");
});

test("accepts one match and simulates an Open Payments payout", async () => {
  const created = await demoClient.post("/add_job_listing", {
    job_type: "Cleaning",
    location: "Cape Town",
    pay_per_hour: 60,
  });
  expect(created.data.id).toBeGreaterThan(0);

  const accepted = await demoClient.post("/accept_offer", { id: 4 });
  expect(accepted.data.success).toBe(true);

  const offers = await demoClient.get("/get_all_offer_listings");
  expect(offers.data.find((offer) => offer.id === 4).state).toBe("ongoing");
  expect(offers.data.find((offer) => offer.id === 6).state).toBe("offered");

  const payment = await demoClient.post("/make_payments", { jobId: 5 });
  expect(payment.data.simulated).toBe(true);
  expect(payment.data.success).toBe(true);
  expect(payment.data.amount.display).toBe("R840");
  expect(payment.data.sendingWallet.label).toBe("Thandi Nkosi demo wallet");
  expect(payment.data.receivingWallet.label).toBe("Ayesha Patel demo wallet");
  expect(payment.data.steps.map((step) => step.status)).toEqual([
    "granted",
    "created",
    "granted",
    "created",
    "finalized",
    "completed",
  ]);

  const after = await demoClient.get("/get_all_offer_listings");
  expect(after.data.find((offer) => offer.id === 5).state).toBe("complete");
});
