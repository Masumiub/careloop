import "dotenv/config";
import { db, pool } from "./index";
import { participants, serviceRequests, staff } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number, hour = 9): Date {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, Math.floor(Math.random() * 50) + 5, 0, 0);
  return d;
}

function isoDay(days: number): string {
  const d = new Date(Date.now() + days * DAY);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const existing = await db.select({ id: participants.id }).from(participants).limit(1);
  if (existing.length && !process.argv.includes("--force")) {
    console.log("Database already seeded — skipping (use --force to reseed).");
    return;
  }
  if (existing.length) {
    console.log("--force passed, clearing existing demo data…");
    await db.delete(serviceRequests);
    await db.delete(participants);
    await db.delete(staff);
  }

  const seededParticipants = await db
    .insert(participants)
    .values([
      {
        name: "Ruby Hammond",
        preferredName: "Ruby",
        email: "ruby.hammond@example.com.au",
        phone: "0412 447 810",
        suburb: "Carlton",
        state: "VIC",
        postcode: "3053",
        ndisNumber: "431 284 902",
        supportNeeds: ["Mobility support", "Personal care", "Community access"],
        accessibilityNotes:
          "Wheelchair user — requires step-free access and a hoist for transfers. Prefers female support workers.",
        color: "wattle",
      },
      {
        name: "Declan O'Brien",
        preferredName: "Dec",
        email: "declan.obrien@example.com.au",
        phone: "0491 570 223",
        suburb: "Fremantle",
        state: "WA",
        postcode: "6160",
        ndisNumber: "512 908 447",
        supportNeeds: ["Vision impairment", "Orientation & mobility", "Assistive tech"],
        accessibilityNotes:
          "Legally blind — communicates best by phone. Guide dog 'Scout' comes to all appointments.",
        color: "pine",
      },
      {
        name: "Mei-Ling Chen",
        email: "meiling.chen@example.com.au",
        phone: "0433 281 905",
        suburb: "Box Hill",
        state: "VIC",
        postcode: "3128",
        ndisNumber: "448 775 120",
        supportNeeds: ["Auslan interpretation", "Domestic assistance"],
        accessibilityNotes: "Deaf — Auslan preferred. Please text rather than call.",
        color: "violet",
      },
      {
        name: "Jack Thompson",
        email: "jack.thompson@example.com.au",
        phone: "0421 665 340",
        suburb: "Newtown",
        state: "NSW",
        postcode: "2042",
        ndisNumber: "390 114 662",
        supportNeeds: ["Intellectual disability", "Daily living skills", "Community access"],
        accessibilityNotes:
          "Responds well to routine and visual schedules. Mum (Carol) is primary contact for changes.",
        color: "sky",
      },
      {
        name: "Aisha Rahman",
        email: "aisha.rahman@example.com.au",
        phone: "0455 902 118",
        suburb: "Dandenong",
        state: "VIC",
        postcode: "3175",
        ndisNumber: "477 830 215",
        supportNeeds: ["Multiple sclerosis", "Fatigue management", "Transport"],
        accessibilityNotes:
          "Energy levels vary day to day — morning appointments preferred. Uses a motorised scooter.",
        color: "coral",
      },
      {
        name: "Cooper Wilson",
        email: "cooper.wilson@example.com.au",
        phone: "0409 118 764",
        suburb: "Surry Hills",
        state: "NSW",
        postcode: "2010",
        ndisNumber: "508 441 997",
        supportNeeds: ["Autism spectrum", "Social participation", "Meal support"],
        accessibilityNotes:
          "Sensory sensitivities — quiet environments please. Loves trains and the NRL.",
        color: "leaf",
      },
      {
        name: "Ngarra Williams",
        email: "ngarra.williams@example.com.au",
        phone: "0477 233 590",
        suburb: "Redfern",
        state: "NSW",
        postcode: "2016",
        ndisNumber: "423 667 105",
        supportNeeds: ["Acquired brain injury", "Memory support", "Respite"],
        accessibilityNotes:
          "Aunty Ros helps coordinate care. Yarning-first communication style appreciated.",
        color: "wattle",
      },
      {
        name: "Sophie Kowalski",
        email: "sophie.kowalski@example.com.au",
        phone: "0468 340 912",
        suburb: "Brunswick",
        state: "VIC",
        postcode: "3056",
        ndisNumber: "461 209 833",
        supportNeeds: ["Cerebral palsy", "Allied health", "Personal care"],
        accessibilityNotes:
          "Uses a communication device — allow extra time for responses. Keen footy fan (go the Pies).",
        color: "pine",
      },
      {
        name: "Tom Fitzgerald",
        email: "tom.fitzgerald@example.com.au",
        phone: "0437 881 204",
        suburb: "Sandy Bay",
        state: "TAS",
        postcode: "7005",
        ndisNumber: "487 552 340",
        supportNeeds: ["Spinal cord injury", "Home maintenance", "Transport"],
        accessibilityNotes: "Modified vehicle driver. Ramps installed at front and rear entries.",
        color: "sky",
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@example.com.au",
        phone: "0402 667 481",
        suburb: "Parramatta",
        state: "NSW",
        postcode: "2150",
        ndisNumber: "440 918 276",
        supportNeeds: ["Psychosocial disability", "Peer support", "Community access"],
        accessibilityNotes:
          "Prefers consistent workers and advance notice of any schedule changes.",
        color: "violet",
      },
    ])
    .returning();

  const seededStaff = await db
    .insert(staff)
    .values([
      {
        name: "Sarah Mitchell",
        email: "sarah.mitchell@careloop.au",
        phone: "03 9005 4410",
        role: "Support Coordinator",
        region: "Melbourne Metro",
        specialities: ["NDIS planning", "Complex care"],
        color: "pine",
      },
      {
        name: "Liam Walker",
        email: "liam.walker@careloop.au",
        phone: "03 9005 4411",
        role: "Support Worker",
        region: "Melbourne North",
        specialities: ["Personal care", "Manual handling"],
        color: "sky",
      },
      {
        name: "Grace Nguyen",
        email: "grace.nguyen@careloop.au",
        phone: "03 9005 4412",
        role: "Support Worker",
        region: "Melbourne East",
        specialities: ["Domestic assistance", "Meal preparation", "Auslan (basic)"],
        color: "coral",
      },
      {
        name: "Omar Hassan",
        email: "omar.hassan@careloop.au",
        phone: "02 8011 7780",
        role: "Community Access Worker",
        region: "Sydney Inner West",
        specialities: ["Community access", "Social groups", "Travel training"],
        color: "wattle",
      },
      {
        name: "Ellie Brooks",
        email: "ellie.brooks@careloop.au",
        phone: "02 8011 7781",
        role: "Team Lead",
        region: "NSW & ACT",
        specialities: ["Rostering", "Incident response", "Quality & safeguards"],
        color: "violet",
      },
      {
        name: "Marcus Reid",
        email: "marcus.reid@careloop.au",
        phone: "08 6210 3390",
        role: "Support Worker",
        region: "Perth & Fremantle",
        specialities: ["Vision impairment support", "Assistive technology"],
        color: "leaf",
      },
      {
        name: "Hannah Doyle",
        email: "hannah.doyle@careloop.au",
        phone: "03 6214 8102",
        role: "Allied Health Assistant",
        region: "Hobart & Southern TAS",
        specialities: ["Physio programs", "Hydrotherapy support"],
        color: "coral",
      },
    ])
    .returning();

  const [pRuby, pDeclan, pMei, pJack, pAisha, pCooper, pNgarra, pSophie, pTom, pPriya] =
    seededParticipants;
  const [sSarah, sLiam, sGrace, sOmar, sEllie, sMarcus, sHannah] = seededStaff;

  type SeedRequest = {
    participantId: string;
    serviceType: string;
    title: string;
    description: string;
    suburb: string;
    preferredDate: string | null;
    preferredTime: string;
    priority: string;
    status: string;
    assignedStaffId?: string | null;
    staffNotes?: string | null;
    createdAt: Date;
    updatedAt?: Date;
  };

  const requests: SeedRequest[] = [
    {
      participantId: pRuby.id,
      serviceType: "personal-care",
      title: "Morning shower and dressing support",
      description:
        "Regular morning routine support — shower, dressing and hair. Hoist is set up in the bathroom. Roughly 90 minutes.",
      suburb: "Carlton",
      preferredDate: isoDay(1),
      preferredTime: "Morning (7am – 12pm)",
      priority: "high",
      status: "pending",
      createdAt: daysFromNow(-0.25, 21),
    },
    {
      participantId: pDeclan.id,
      serviceType: "tech-assistance",
      title: "Set up new screen reader on laptop",
      description:
        "I've just got a new laptop through my plan and need help installing and configuring NVDA plus my email. Scout will be snoozing under the desk.",
      suburb: "Fremantle",
      preferredDate: isoDay(3),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "medium",
      status: "pending",
      createdAt: daysFromNow(-0.5, 18),
    },
    {
      participantId: pAisha.id,
      serviceType: "transport",
      title: "Lift to MS specialist appointment",
      description:
        "Appointment at Monash Medical Centre at 10:30am Thursday. I use a motorised scooter so wheelchair-accessible vehicle needed.",
      suburb: "Dandenong",
      preferredDate: isoDay(2),
      preferredTime: "Morning (7am – 12pm)",
      priority: "urgent",
      status: "pending",
      createdAt: daysFromNow(-0.4, 19),
    },
    {
      participantId: pPriya.id,
      serviceType: "community-access",
      title: "Support to attend evening art class",
      description:
        "Weekly pottery class at Parramatta Artists' Studios, 6–8pm. I'd like a familiar worker to come along for the first few sessions.",
      suburb: "Parramatta",
      preferredDate: isoDay(5),
      preferredTime: "Evening (5pm – 9pm)",
      priority: "medium",
      status: "pending",
      createdAt: daysFromNow(-0.6, 20),
    },
    {
      participantId: pCooper.id,
      serviceType: "meal-preparation",
      title: "Cook-ahead dinners for the week",
      description:
        "Help batch-cooking five dinners I can reheat — nothing too spicy. I like to help with the chopping. Quiet kitchen preferred, no music.",
      suburb: "Surry Hills",
      preferredDate: isoDay(4),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "medium",
      status: "pending",
      createdAt: daysFromNow(-0.3, 22),
    },
    {
      participantId: pNgarra.id,
      serviceType: "respite-care",
      title: "Saturday afternoon respite for Aunty Ros",
      description:
        "Aunty Ros has a family event Saturday arvo. I'd like company at home — maybe a yarn and the footy on TV. Memory prompts for afternoon meds.",
      suburb: "Redfern",
      preferredDate: isoDay(6),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "high",
      status: "pending",
      createdAt: daysFromNow(-0.2, 23),
    },
    {
      participantId: pRuby.id,
      serviceType: "community-access",
      title: "Trip to the NGV and lunch on Lygon Street",
      description:
        "The French Impressionism exhibition finishes soon and I don't want to miss it. Wheelchair taxi booked for 11am pickup if needed.",
      suburb: "Carlton",
      preferredDate: isoDay(7),
      preferredTime: "Morning (7am – 12pm)",
      priority: "low",
      status: "in_progress",
      assignedStaffId: sLiam.id,
      staffNotes: "Gallery tickets purchased. Confirmed accessible entry via the Waterwall entrance.",
      createdAt: daysFromNow(-3, 10),
    },
    {
      participantId: pJack.id,
      serviceType: "community-access",
      title: "Newtown Jets game with a support mate",
      description:
        "Home game at Henson Park this Sunday. Jack has a season pass — needs support with transport, snacks and the social side of the crowd.",
      suburb: "Newtown",
      preferredDate: isoDay(5),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "high",
      status: "in_progress",
      assignedStaffId: sOmar.id,
      staffNotes: "Visual schedule prepared. Ear defenders packed. Carol confirms kickoff 3pm.",
      createdAt: daysFromNow(-4, 14),
    },
    {
      participantId: pSophie.id,
      serviceType: "allied-health",
      title: "Hydrotherapy session transport and support",
      description:
        "Standing hydro appointment at the Brunswick Baths, Tuesdays 9am. Need help with transport and getting changed afterwards.",
      suburb: "Brunswick",
      preferredDate: isoDay(4),
      preferredTime: "Morning (7am – 12pm)",
      priority: "high",
      status: "in_progress",
      assignedStaffId: sSarah.id,
      staffNotes: "Hannah's physio program confirmed with pool physio. Bring wheelchair-accessible van.",
      createdAt: daysFromNow(-5, 8),
    },
    {
      participantId: pMei.id,
      serviceType: "domestic-assistance",
      title: "Weekly clean and laundry",
      description:
        "Two-bedroom unit — floors, bathroom, kitchen and a load of washing. Vacuum is in the hall cupboard. Please text on arrival, don't knock.",
      suburb: "Box Hill",
      preferredDate: isoDay(2),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "in_progress",
      assignedStaffId: sGrace.id,
      staffNotes: "Recurring booking set up. Grace attends weekly; basic Auslan confirmed for check-in.",
      createdAt: daysFromNow(-6, 11),
    },
    {
      participantId: pDeclan.id,
      serviceType: "transport",
      title: "Weekly grocery run to Fremantle Markets",
      description:
        "Friday market run — about 90 minutes. Reading labels is the main help needed. Scout rides along and is very well behaved.",
      suburb: "Fremantle",
      preferredDate: isoDay(3),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "in_progress",
      assignedStaffId: sMarcus.id,
      staffNotes: "Standing Friday booking. Marcus has the shopping list routine down pat.",
      createdAt: daysFromNow(-7, 15),
    },
    {
      participantId: pTom.id,
      serviceType: "home-garden",
      title: "Ramp handrail tighten and winter garden tidy",
      description:
        "Front ramp handrail has come loose and the garden needs a winter clear-out before the frost. Power tools in the garage.",
      suburb: "Sandy Bay",
      preferredDate: isoDay(4) ,
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "medium",
      status: "in_progress",
      assignedStaffId: sHannah.id,
      staffNotes: "Maintenance contractor booked for the handrail; Hannah doing garden tidy same day.",
      createdAt: daysFromNow(-6, 16),
    },
    {
      participantId: pAisha.id,
      serviceType: "domestic-assistance",
      title: "Fortnightly home tidy",
      description:
        "Light tidy and change bed linen — energy's been low this month. Two hours max, mornings are best before fatigue kicks in.",
      suburb: "Dandenong",
      preferredDate: isoDay(-2),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "completed",
      assignedStaffId: sGrace.id,
      staffNotes: "Completed. Linen changed, bathroom done. Aisha resting well when we left.",
      createdAt: daysFromNow(-9, 9),
      updatedAt: daysFromNow(-2, 13),
    },
    {
      participantId: pMei.id,
      serviceType: "personal-care",
      title: "Meal planning and cooking lesson",
      description:
        "I'd like to learn three new one-pot recipes. Written instructions in large print please, and happy to be shown rather than told.",
      suburb: "Box Hill",
      preferredDate: isoDay(-4),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "low",
      status: "completed",
      assignedStaffId: sGrace.id,
      staffNotes: "Three recipes taught and printed. Nasi goreng was the favourite!",
      createdAt: daysFromNow(-11, 10),
      updatedAt: daysFromNow(-4, 17),
    },
    {
      participantId: pCooper.id,
      serviceType: "transport",
      title: "Travel training to Central Station",
      description:
        "Practising the train trip from Central to my brother's place at Redfern. Quiet carriage, off-peak times only.",
      suburb: "Surry Hills",
      preferredDate: isoDay(-3),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "medium",
      status: "completed",
      assignedStaffId: sOmar.id,
      staffNotes: "Great session — Cooper navigated the trip solo on the return leg. Big win.",
      createdAt: daysFromNow(-10, 13),
      updatedAt: daysFromNow(-3, 16),
    },
    {
      participantId: pRuby.id,
      serviceType: "personal-care",
      title: "Evening routine support — trial shift",
      description:
        "Trial evening support session ahead of Mum's trip away in July. Dinner, transfers and settling in for the night.",
      suburb: "Carlton",
      preferredDate: isoDay(-6),
      preferredTime: "Evening (5pm – 9pm)",
      priority: "medium",
      status: "completed",
      assignedStaffId: sLiam.id,
      staffNotes: "Trial went smoothly. Ruby happy to continue with Liam for the July roster.",
      createdAt: daysFromNow(-12, 12),
      updatedAt: daysFromNow(-6, 21),
    },
    {
      participantId: pJack.id,
      serviceType: "domestic-assistance",
      title: "Big spring clean of the flat",
      description:
        "Jack's flat is due for a deep clean — kitchen, oven and windows. Visual checklist helps keep momentum.",
      suburb: "Newtown",
      preferredDate: isoDay(-7),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "completed",
      assignedStaffId: sOmar.id,
      staffNotes: "Flat sparkling. Left laminated checklist on the fridge for weekly upkeep.",
      createdAt: daysFromNow(-13, 9),
      updatedAt: daysFromNow(-7, 12),
    },
    {
      participantId: pPriya.id,
      serviceType: "tech-assistance",
      title: "Help setting up video calls with sister in Brisbane",
      description:
        "New tablet — need WhatsApp set up and a practice call. Step-by-step written notes appreciated for next time.",
      suburb: "Parramatta",
      preferredDate: isoDay(-5),
      preferredTime: "Evening (5pm – 9pm)",
      priority: "low",
      status: "completed",
      assignedStaffId: sEllie.id,
      staffNotes: "WhatsApp set up, practice call made. Cheat-sheet taped inside the tablet cover.",
      createdAt: daysFromNow(-8, 17),
      updatedAt: daysFromNow(-5, 19),
    },
    {
      participantId: pTom.id,
      serviceType: "allied-health",
      title: "Wheelchair cushion pressure review",
      description:
        "Cushion feels like it's bottoming out. Would like a review and advice on options before it becomes a pressure issue.",
      suburb: "Sandy Bay",
      preferredDate: isoDay(-1),
      preferredTime: "Morning (7am – 12pm)",
      priority: "high",
      status: "completed",
      assignedStaffId: sHannah.id,
      staffNotes: "Reviewed with OT. ROHO cushion ordered through plan funding, due next week.",
      createdAt: daysFromNow(-5, 8),
      updatedAt: daysFromNow(-1, 12),
    },
    {
      participantId: pDeclan.id,
      serviceType: "community-access",
      title: "Sailing club open day",
      description:
        "SWD (Sailability) open day at East Fremantle Yacht Club — I'd love to get back on the water. Transfer assist needed into the boat.",
      suburb: "Fremantle",
      preferredDate: isoDay(-8),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "cancelled",
      assignedStaffId: sMarcus.id,
      staffNotes: "Cancelled by club due to strong winds. Declan keen to rebook for the next open day.",
      createdAt: daysFromNow(-14, 10),
      updatedAt: daysFromNow(-8, 8),
    },
    {
      participantId: pNgarra.id,
      serviceType: "domestic-assistance",
      title: "Pantry reorganise with labels",
      description:
        "Memory's been tricky — want the pantry labelled so I can find things myself. Big print labels, pictures even better.",
      suburb: "Redfern",
      preferredDate: isoDay(-2),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "cancelled",
      createdAt: daysFromNow(-6, 15),
      updatedAt: daysFromNow(-3, 9),
    },
    {
      participantId: pSophie.id,
      serviceType: "meal-preparation",
      title: "Birthday lunch help for Mum's 60th",
      description:
        "Mum turns 60 on the 14th — want to cook her favourite roast with a little help. Communication device might make me slow but I'll get there.",
      suburb: "Brunswick",
      preferredDate: isoDay(9),
      preferredTime: "Morning (7am – 12pm)",
      priority: "high",
      status: "pending",
      createdAt: daysFromNow(-1, 16),
    },
    {
      participantId: pNgarra.id,
      serviceType: "community-access",
      title: "Men's yarning circle at the Block",
      description:
        "Fortnightly yarning circle on Tuesday mornings. Transport plus a friendly face until I settle in with the group.",
      suburb: "Redfern",
      preferredDate: isoDay(4),
      preferredTime: "Morning (7am – 12pm)",
      priority: "medium",
      status: "pending",
      createdAt: daysFromNow(-0.15, 8),
    },
    {
      participantId: pPriya.id,
      serviceType: "domestic-assistance",
      title: "Wardrobe sort after hospital stay",
      description:
        "Just home from a short stay and the wardrobe's exploded. Sorting clothes by season and labelling drawers would bring the calm back.",
      suburb: "Parramatta",
      preferredDate: isoDay(2),
      preferredTime: "Afternoon (12pm – 5pm)",
      priority: "medium",
      status: "pending",
      createdAt: daysFromNow(-0.1, 12),
    },
    {
      participantId: pJack.id,
      serviceType: "personal-care",
      title: "Support with new morning routine",
      description:
        "Carol's started a new job so I need a hand getting showered, dressed and to the bus by 8:15 on weekdays. Visual schedule is on the bathroom wall.",
      suburb: "Newtown",
      preferredDate: isoDay(1),
      preferredTime: "Morning (7am – 12pm)",
      priority: "urgent",
      status: "pending",
      createdAt: daysFromNow(-0.08, 7),
    },
  ];

  await db
    .insert(serviceRequests)
    .values(requests.map(({ updatedAt, ...r }) => ({ ...r, updatedAt: updatedAt ?? r.createdAt })));

  console.log(
    `Seeded ${seededParticipants.length} participants, ${seededStaff.length} staff and ${requests.length} service requests.`,
  );
}

seed()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
