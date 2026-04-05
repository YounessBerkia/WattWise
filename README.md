<p align="center">
  <img src="assets/banner.png" alt="WattWise Banner" width="100%">
</p>

<h1 align="center">WattWise</h1>

<p align="center">
  <img src="assets/Logo.png" alt="WattWise Logo" width="64" height="64">
  <br><br>
  <a href="https://github.com/yourusername/wattwise/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT">
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat&logo=next.js" alt="Built with Next.js">
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/Powered%20by-React-61DAFB?style=flat&logo=react" alt="Powered by React">
  </a>
</p>

---

## What is WattWise?

I'll be honest—I got tired of not knowing where my electricity was actually going. Sure, the monthly bill arrives, but what does that tell you about consumption patterns? Nothing useful, that's what.

WattWise is an energy tracking dashboard designed for households that want more than just a number on a piece of paper. You enter your meter readings, and it does the heavy lifting: analyzing consumption over time, projecting costs based on your tariff, and giving you real insight into your energy usage.

It's not a smart home integration (though that would be cool). It's for people who still read their meter manually and want to make sense of the data.

---

## Features

Here's what you actually get:

- **Meter Reading Logger** — Enter your readings with dates. That's it. Simple data entry that works.
- **Consumption Analytics** — Visual charts showing your usage over weeks, months, even years. Spot the spikes, find the patterns.
- **Cost Calculator** — Plug in your electricity tariff (price per kWh, base charge, whatever your provider charges), and WattWise projects your costs. No surprises.
- **Dark Mode** — Because nobody wants to be blinded at 2 AM when checking last night's consumption.
- **Data Portability** — Export everything as JSON. Import it later. Your data, your rules.

---

## The Stack

This thing runs on:

- **Next.js 16** (App Router) — The framework that makes React actually usable
- **React 19** — Yes, the newest version. We like living dangerously.
- **Tailwind CSS v4** — Styling that doesn't make you want to pull your hair out
- **Zustand** — State management without the boilerplate hell
- **Recharts** — Charts that don't look like they were designed in 1999
- **React Hook Form + Zod** — Forms that validate themselves. Finally.
- **Vitest** — Testing because we're not animals

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/wattwise.git
cd wattwise

# Install dependencies
npm install

# Fire it up
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

### Building for Production

```bash
npm run build
npm start
```

### Running Tests

```bash
npm run test
```

---

## Project Structure

The code lives in `src/`, broken down into logical chunks:

```
src/
├── app/                 # Next.js App Router pages
│   ├── (dashboard)/    # Dashboard routes (protected layout)
│   └── providers.tsx   # Theme provider setup
├── components/
│   ├── ui/             # Buttons, inputs, cards—the basics
│   └── features/       # Dashboard, analytics, add-entry, etc.
├── lib/                # Calculations, validators, storage utilities
├── stores/             # Zustand state store (energy data lives here)
├── types/              # TypeScript definitions
└── hooks/              # Custom hooks for hydration, store access
```

I organized it this way because it made sense for maintenance. Components are separated by concern, data flows through the store, and everything has types. You'll know where to look.

---

## Contributing

Got ideas? Found a bug? Want to add a feature?

1. Fork it
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

We're not strict about commit messages, but try to make them descriptive. "Fixed stuff" tells nobody anything.

---

## The Philosophy Behind This

I built WattWise because I wanted to understand my energy consumption, not just pay the bill. The German energy market doesn't make it easy—tariffs change, pricing structures get more confusing by the year. This is my attempt to bring some clarity to the chaos.

It's open source because I figured others might find it useful. Plus, having others poke at the code usually makes it better.

---

## License

This project is under the MIT License. Do what you want with it. Attribution is appreciated but not required.

---

## Acknowledgments

- The Okabe-Ito color palette — because accessibility matters even in a utility app
- The Tailwind team — for making CSS actually enjoyable
- Anyone who's ever stared at a meter and wondered "why is this so high?"

---

<p align="center">
  <img src="assets/Logo.png" alt="Made with care" width="32" height="32">
  <br>
  <small>Made with care, not by AI</small>
</p>