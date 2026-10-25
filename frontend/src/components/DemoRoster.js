import { useEffect, useState } from "react";
import { isDemoMode } from "../httpClient";
import { listPeople } from "../demo/store";

function DemoRoster({ kind }) {
  const [people, setPeople] = useState([]);
  const title = kind === "employers" ? "Employers in this demo" : "Workers in this demo";

  useEffect(() => {
    if (!isDemoMode) return;
    const roster = listPeople();
    setPeople(kind === "employers" ? roster.employers : roster.employees);
  }, [kind]);

  if (!isDemoMode || people.length === 0) return null;

  return (
    <section className="demo-roster" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <strong>{person.name}</strong>
            <span>
              {person.skill ? `${person.skill} · ` : ""}
              {person.location}
            </span>
            <span>{person.phone_number}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DemoRoster;
