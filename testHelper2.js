const Typesense = require("typesense")

const client = new Typesense.Client({
  nodes: [
    {
      host: "search.xebraa.co.uk",
      port: "80",
      protocol: "http",
    },
  ],
  apiKey:
    "typesense_live_jwqSeJI64dRpPfEzlltEPZ4Aw0ctsmJCjKtY4Pu7zeqKrA49jYWHxTzzwskZPmcZ",
  connectionTimeoutSeconds: 2,
})

const COLLECTION = "test_users"

const names = [
  "Aquib hossain",
  "Rahim Ahmed",
  "Karim Uddin",
  "Sadia Hossain",
  "Mitu Akter",
  "Tanvir Hasan",
  "Priya Sharma",
  "Rohit Verma",
  "Sneha Kapoor",
  "Amitabh Singh",
  "Kiran Patel",
  "Fahad Khan",
  "Imran Ali",
  "Sara Malik",
  "Bilal Hussain",
  "Ayesha Siddiqui",
  "Arjun Reddy",
  "Neha Bansal",
  "Ravi Kumar",
  "Simran Kaur",
  "Rajesh Gupta",
  "Lovely Angel",
  "Pagal Boy",
  "Cutie Princess",
  "Broken Heart",
  "Chulbuli Rani",
  "Mastani Queen",
  "Babu Shona",
  "Rockstar Raj",
  "Jaaneman",
  "Sweet Poison",
  "King Khan",
  "Queen Diva",
  "Drama King",
  "Attitude Girl",
  "Silent Killer",
  "Mr Handsome",
  "Miss Beautiful",
  "Chocolate Boy",
  "Dream Girl",
  "Tiger Shroff",
  "Baba Yadav",
  "Golu Molu",
  "Laddu Kumar",
  "Pyaari Pari",
  "Hotshot Sameer",
  "Cool Dude Varun",
  "Jhakanaka Jassi",
  "Dabangg Don",
  "Hero No.1",
  "Swaggy Babu",
]

const sampleUsers = names.map((name, i) => ({
  userId: `U${i + 1}`,
  name,
  avatar: `https://cdn.example.com/avatar${i + 1}.jpg`,
  created_at: Date.now(),
}))

async function main() {
  try {
    try {
      await client.collections(COLLECTION).delete()
      console.log("Existing collection deleted.")
    } catch (_) {}

    await client.collections().create({
      name: COLLECTION,
      fields: [
        { name: "userId", type: "string" },
        { name: "name", type: "string" },
        { name: "avatar", type: "string", facet: false },
        { name: "created_at", type: "int64" },
      ],
      default_sorting_field: "created_at",
    })
    console.log("Collection created.")

    for (let user of sampleUsers) {
      await client.collections(COLLECTION).documents().upsert(user)
    }
    console.log("50 sample users inserted.")

    const typoQueries = ["a"]
    for (let q of typoQueries) {
      const results = await client.collections(COLLECTION).documents().search({
        q,
        query_by: "name,userId",
        per_page: 100,
        typo_tokens_threshold: 1,
      })
      console.log(`\nSearch for "${q}" found:`)
      results.hits.forEach((hit) => console.log(hit.document))
    }

    await client.collections(COLLECTION).delete()
    console.log("\nCollection deleted. Cleanup complete.")
  } catch (err) {
    console.error(err)
  }
}

main()
