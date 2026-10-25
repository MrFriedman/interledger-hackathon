// In-browser stand-in for the Express + sqlite backend.
// Nothing here is a real wallet, key, or Interledger address.

const STORAGE_KEY = "jobmatch-sa-demo-v1";

let memory = null;

function fullName(person) {
  if (!person) return null;
  return `${person.name} ${person.surname}`.trim();
}

function seed() {
  const employers = [
    {
      id: "employer-thandi",
      name: "Thandi",
      surname: "Nkosi",
      phone_number: "084 555 0164",
      role: "employer",
      location: "Cape Town",
    },
    {
      id: "employer-johan",
      name: "Johan",
      surname: "van Wyk",
      phone_number: "082 555 0173",
      role: "employer",
      location: "Johannesburg",
    },
    {
      id: "employer-priya",
      name: "Priya",
      surname: "Naidoo",
      phone_number: "079 555 0128",
      role: "employer",
      location: "Durban",
    },
  ];

  const employees = [
    {
      id: "employee-sipho",
      name: "Sipho",
      surname: "Dlamini",
      phone_number: "082 555 0142",
      role: "employee",
      location: "Johannesburg",
      skill: "Gardening",
    },
    {
      id: "employee-ayesha",
      name: "Ayesha",
      surname: "Patel",
      phone_number: "071 555 0198",
      role: "employee",
      location: "Cape Town",
      skill: "Cleaning",
    },
    {
      id: "employee-lerato",
      name: "Lerato",
      surname: "Mokoena",
      phone_number: "083 555 0117",
      role: "employee",
      location: "Durban",
      skill: "Cooking",
    },
  ];

  const listings = [
    {
      id: 1,
      job_type: "Gardening",
      location: "Johannesburg",
      pay_per_hour: 85,
      applicant_id: "employee-sipho",
    },
    {
      id: 2,
      job_type: "Cleaning",
      location: "Cape Town",
      pay_per_hour: 70,
      applicant_id: "employee-ayesha",
    },
    {
      id: 3,
      job_type: "Cooking",
      location: "Durban",
      pay_per_hour: 95,
      applicant_id: "employee-lerato",
    },
  ];

  const offers = [
    {
      id: 4,
      job_type: "Gardening",
      location: "Johannesburg",
      pay_per_hour: 85,
      address: "14 Oxford Road, Parktown",
      start_date: "2024-11-18T07:30:00",
      hours_per_day: 5,
      num_days: 2,
      job_description:
        "Trim the hedges and clear the pavement before a family visit.",
      state: "offered",
      applicant_id: "employee-sipho",
      customer_id: "employer-johan",
    },
    {
      id: 5,
      job_type: "Cleaning",
      location: "Cape Town",
      pay_per_hour: 70,
      address: "18 Avenue, Fresnaye",
      start_date: "2024-11-12T09:00:00",
      hours_per_day: 4,
      num_days: 3,
      job_description:
        "Weekly house clean, including the kitchen and two bathrooms.",
      state: "ongoing",
      applicant_id: "employee-ayesha",
      customer_id: "employer-thandi",
    },
    {
      id: 6,
      job_type: "Cooking",
      location: "Durban",
      pay_per_hour: 95,
      address: "22 Florida Road, Morningside",
      start_date: "2024-11-20T16:00:00",
      hours_per_day: 6,
      num_days: 1,
      job_description: "Cook a family supper for eight and leave the kitchen tidy.",
      state: "offered",
      applicant_id: "employee-lerato",
      customer_id: "employer-priya",
    },
  ];

  return { nextId: 7, employers, employees, listings, offers };
}

function session() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch (err) {
    return null;
  }
  return null;
}

function readSession() {
  const store = session();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.listings) || !Array.isArray(parsed.offers)) {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

function writeSession(db) {
  const store = session();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    // Private mode can reject storage; the in-memory copy still works.
  }
}

export function loadDemoDb() {
  if (memory) return memory;
  memory = readSession() || seed();
  writeSession(memory);
  return memory;
}

export function persistDemoDb(db) {
  memory = db;
  writeSession(db);
}

export function clearDemoData() {
  memory = null;
  const store = session();
  if (store) {
    try {
      store.removeItem(STORAGE_KEY);
    } catch (err) {
      // Ignore storage failures and still fall back to the seed.
    }
  }
}

export function resetDemoData() {
  clearDemoData();
  window.location.reload();
}

export function listPeople() {
  const db = loadDemoDb();
  const present = (person) => ({
    id: person.id,
    name: fullName(person),
    phone_number: person.phone_number,
    location: person.location,
    role: person.role,
    skill: person.skill || null,
  });
  return {
    employers: db.employers.map(present),
    employees: db.employees.map(present),
  };
}

function sameId(left, right) {
  return String(left) === String(right);
}

function findPerson(people, id) {
  return people.find((person) => sameId(person.id, id)) || null;
}

export function presentListing(db, listing) {
  const employee = findPerson(db.employees, listing.applicant_id);
  return {
    ...listing,
    pay_per_hour: Number(listing.pay_per_hour),
    employee_name: fullName(employee),
    employee_phone: employee ? employee.phone_number : null,
    employee_location: employee ? employee.location : null,
  };
}

export function presentOffer(db, offer) {
  const employee = findPerson(db.employees, offer.applicant_id);
  const employer = findPerson(db.employers, offer.customer_id);
  return {
    ...offer,
    pay_per_hour: Number(offer.pay_per_hour),
    hours_per_day: Number(offer.hours_per_day),
    num_days: Number(offer.num_days),
    employee_name: fullName(employee),
    employer_name: fullName(employer),
    employee_phone: employee ? employee.phone_number : null,
    employer_phone: employer ? employer.phone_number : null,
  };
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
