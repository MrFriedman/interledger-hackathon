import {
  createAuthenticatedClient,
  isFinalizedGrant,
} from "@interledger/open-payments";
import readline from "readline/promises";
import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { getOpenPaymentsConfig } from "./paymentsConfig.js";

//const bodyParser = require("body-parser");
//const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database("./jobs.db"); // Replace with your actual database file

// Route to add a job listing
app.post("/add_job_listing", (req, res) => {
  const { job_type, location, pay_per_hour } = req.body;

  // Check if all required fields are provided
  if (!job_type || !location || !pay_per_hour) {
    return res
      .status(400)
      .json({ error: "Job type, location, and pay per hour are required." });
  }

  // Insert job listing into the database
  const sql = `
        INSERT INTO JobListingAvailable (job_type, location, pay_per_hour)
        VALUES (?, ?, ?)
    `;
  db.run(sql, [job_type, location, pay_per_hour], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Failed to add job listing." });
    }

    // Return the generated ID of the new job listing
    res.status(201).json({ id: this.lastID });
  });
});

// Route to get all available job listings
app.get("/get_all_available_listings", (req, res) => {
  const sql = `SELECT * FROM JobListingAvailable`; // SQL query to select all records

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: "Failed to retrieve job listings." });
    }

    // Send the retrieved rows as an array
    res.status(200).json(rows);
  });
});

// Route to get all job listing offers
app.get("/get_all_offer_listings", (req, res) => {
  const sql = `SELECT * FROM JobListingOffer`; // SQL query to select all records

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: "Failed to retrieve job listings." });
    }

    // Send the retrieved rows as an array
    res.status(200).json(rows);
  });
});

// Route to add a job listing
app.post("/add_job_listing_offer", (req, res) => {
  const {
    job_type,
    location,
    pay_per_hour,
    address,
    start_date,
    hours_per_day,
    num_days,
    job_description,
    applicant_id,
    customer_id,
  } = req.body;

  db.serialize(() => {
    const stmt = db.prepare(`
        INSERT INTO JobListingOffer (
          job_type, 
          location, 
          pay_per_hour, 
          address, 
          start_date, 
          hours_per_day, 
          num_days, 
          job_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

    stmt.run(
      job_type,
      location,
      pay_per_hour,
      address,
      start_date,
      hours_per_day,
      num_days,
      job_description,
      applicant_id,
      customer_id
    );

    stmt.finalize();

    res.status(201).json({ message: "Job listing added successfully" });
  });
});

// Route to accept an offer and delete the post from both tables
app.post("/accept_offer", (req, res) => {
  const { id } = req.body;

  db.serialize(() => {
    // Delete the post from JobListingAvailable
    db.run(
      `DELETE FROM JobListingAvailable WHERE id = ?`,
      [id],
      function (err) {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to delete from JobListingAvailable" });
        }
      }
    );

    // Update the state of all postings in JobListingOffer to "ongoing"
    db.run(
      `UPDATE JobListingOffer SET state = ?`,
      ["ongoing"], // Assuming customer_id corresponds to the deleted post's ID
      function (err) {
        if (err) {
          return res.status(500).json({
            error: "Failed to update JobListingOffer state to ongoing",
          });
        }

        // Successfully deleted and updated
        return res.status(200).json({ success: true });
      }
    );
  });
});

// Route to reject an offer and delete the post from both tables
app.post("/reject_offer", (req, res) => {
  const { id } = req.body;

  db.serialize(() => {
    // Delete the post from JobListingAvailable
    db.run(
      `DELETE FROM JobListingAvailable WHERE id = ?`,
      [id],
      function (err) {
        if (err) {
          return res
            .status(500)
            .json({ error: "Failed to delete from JobListingAvailable" });
        }

        // Delete the post from JobListingOffer
        db.run(
          `DELETE FROM JobListingOffer WHERE id = ?`,
          [id],
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ error: "Failed to delete from JobListingOffer" });
            }

            // Respond with success message
            res.status(200).json({
              message: `Job offer with ID ${id} rejected and removed from both tables.`,
            });
          }
        );
      }
    );
  });
});

app.post("/make_payments", async (req, res) => {
  const config = getOpenPaymentsConfig();
  if (config.missing.length > 0) {
    return res.status(503).json({
      error:
        "Open Payments is not configured. Set the variables in backend/.env.example.",
      missing: config.missing,
    });
  }

  try {
  const client = await createAuthenticatedClient({
    walletAddressUrl: config.walletAddressUrl,
    privateKey: config.privateKey,
    keyId: config.keyId,
  });

  const sendingWalletAddress = await client.walletAddress.get({
    url: config.walletAddressUrl,
  });
  const receivingWalletAddress = await client.walletAddress.get({
    url: config.receivingWalletAddressUrl,
  });

  console.log(
    "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
    { receivingWalletAddress, sendingWalletAddress }
  );

  // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
  const incomingPaymentGrant = await client.grant.request(
    {
      url: receivingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "incoming-payment",
            actions: ["read", "complete", "create"],
          },
        ],
      },
    }
  );

  console.log(
    "\nStep 1: got incoming payment grant for receiving wallet address",
    incomingPaymentGrant
  );

  // Step 2: Create the incoming payment. This will be where funds will be received.
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receivingWalletAddress.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value,
    },
    {
      walletAddress: receivingWalletAddress.id,
      incomingAmount: {
        assetCode: receivingWalletAddress.assetCode,
        assetScale: receivingWalletAddress.assetScale,
        value: "5000",
      },
    }
  );

  console.log(
    "\nStep 2: created incoming payment on receiving wallet address",
    incomingPayment
  );

  // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
  const quoteGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "quote",
            actions: ["create", "read"],
          },
        ],
      },
    }
  );

  console.log(
    "\nStep 3: got quote grant on sending wallet address",
    quoteGrant
  );

  // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
  const quote = await client.quote.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      receiver: incomingPayment.id,
      method: "ilp",
    }
  );

  console.log("\nStep 4: got quote on sending wallet address", quote);

  // Step 5: Start the grant process for the outgoing payments.
  // This is an interactive grant: the user (in this case, you) will need to accept the grant by navigating to the outputted link.
  const outgoingPaymentGrant = await client.grant.request(
    {
      url: sendingWalletAddress.authServer,
    },
    {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["read", "create"],
            limits: {
              debitAmount: {
                assetCode: quote.debitAmount.assetCode,
                assetScale: quote.debitAmount.assetScale,
                value: quote.debitAmount.value,
              },
            },
            identifier: sendingWalletAddress.id,
          },
        ],
      },
      interact: {
        start: ["redirect"],
        // finish: {
        //   method: "redirect",
        //   // This is where you can (optionally) redirect a user to after going through interaction.
        //   // Keep in mind, you will need to parse the interact_ref in the resulting interaction URL,
        //   // and pass it into the grant continuation request.
        //   uri: "https://example.com",
        //   nonce: crypto.randomUUID(),
        // },
      },
    }
  );

  console.log(
    "\nStep 5: got pending outgoing payment grant",
    outgoingPaymentGrant
  );
  console.log(
    "Please navigate to the following URL, to accept the interaction from the sending wallet:"
  );
  console.log(outgoingPaymentGrant.interact.redirect);

  await readline
    .createInterface({ input: process.stdin, output: process.stdout })
    .question("\nPlease accept grant and press enter...");

  let finalizedOutgoingPaymentGrant;

  const grantContinuationErrorMessage =
    "\nThere was an error continuing the grant. You probably have not accepted the grant at the url (or it has already been used up, in which case, rerun the script).";

  try {
    finalizedOutgoingPaymentGrant = await client.grant.continue({
      url: outgoingPaymentGrant.continue.uri,
      accessToken: outgoingPaymentGrant.continue.access_token.value,
    });
  } catch (err) {
    console.log(grantContinuationErrorMessage);
    return res.status(400).json({
      error:
        "Could not continue the outgoing payment grant. Accept the interaction URL, then try again.",
    });
  }

  if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
    console.log(
      "There was an error continuing the grant. You probably have not accepted the grant at the url."
    );
    return res.status(400).json({
      error:
        "Outgoing payment grant was not finalized. Accept the interaction URL, then try again.",
    });
  }

  console.log(
    "\nStep 6: got finalized outgoing payment grant",
    finalizedOutgoingPaymentGrant
  );

  // Step 7: Finally, create the outgoing payment on the sending wallet address.
  // This will make a payment from the outgoing payment to the incoming one (over ILP)
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: finalizedOutgoingPaymentGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      quoteId: quote.id,
    }
  );

  console.log(
    "\nStep 7: Created outgoing payment. Funds will now move from the outgoing payment to the incoming payment.",
    outgoingPayment
  );

  return res.status(200).json({
    success: true,
    outgoingPaymentId: outgoingPayment.id,
  });
  } catch (err) {
    console.error("Open Payments request failed");
    if (!res.headersSent) {
      return res.status(500).json({ error: "Open Payments request failed." });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
