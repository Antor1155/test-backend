//todo: User service.

const Typesense = require("typesense")

class UserService {
  static client = new Typesense.Client({
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

  static collections = {
    heartlive: "users_heartlive",
    pencil: "users_pencil",
  }

  static async ensureCollection(app) {
    const collectionName = this.collections[app]
    if (!collectionName) throw new Error("Invalid app name")
    try {
      await this.client.collections(collectionName).retrieve()
    } catch (err) {
      if (err.httpStatus === 404) {
        try {
          await this.client.collections().create({
            name: collectionName,
            fields: [
              { name: "userId", type: "string" },
              { name: "name", type: "string" },
              { name: "avatar", type: "string" },
              { name: "created_at", type: "int64" },
            ],
            default_sorting_field: "created_at",
          })
        } catch {
          return null
        }
      } else {
        return null
      }
    }
    return collectionName
  }

  static async createUser(app, { userId, name, avatar }) {
    try {
      const collectionName = await this.ensureCollection(app)
      if (!collectionName) return null
      const doc = {
        id: userId,
        userId,
        name,
        avatar,
        created_at: Date.now(),
      }
      return await this.client
        .collections(collectionName)
        .documents()
        .upsert(doc)
    } catch {
      return null
    }
  }

  static async getUser(app, userId) {
    try {
      const collectionName = await this.ensureCollection(app)
      if (!collectionName) return null
      return await this.client
        .collections(collectionName)
        .documents(userId)
        .retrieve()
    } catch {
      return null
    }
  }

  static async searchUser(app, query) {
    try {
      const collectionName = await this.ensureCollection(app)
      if (!collectionName) return null
      const searchResult = await this.client
        .collections(collectionName)
        .documents()
        .search({
          q: query,
          query_by: "userId,name",
          typo_tokens_threshold: 1,
        })
      return searchResult.hits.map((hit) => hit.document)
    } catch {
      return null
    }
  }

  static async updateUser(app, userId, updates) {
    try {
      const collectionName = await this.ensureCollection(app)
      if (!collectionName) return null
      let existing
      try {
        existing = await this.client
          .collections(collectionName)
          .documents(userId)
          .retrieve()
      } catch {
        existing = { created_at: Date.now(), avatar: "" }
      }
      const updatedDoc = {
        ...existing,
        ...updates,
        id: userId,
        created_at: existing.created_at || Date.now(),
        updated_at: Date.now(),
      }
      return await this.client
        .collections(collectionName)
        .documents()
        .upsert(updatedDoc)
    } catch {
      return null
    }
  }

  static async deleteUser(app, userId) {
    try {
      const collectionName = await this.ensureCollection(app)
      if (!collectionName) return null
      return await this.client
        .collections(collectionName)
        .documents(userId)
        .delete()
    } catch {
      return null
    }
  }

  static async deleteAllCollections() {
    try {
      const collections = await this.client.collections().retrieve()
      for (let col of collections) {
        await this.client.collections(col.name).delete()
      }
      return true
    } catch {
      return null
    }
  }
}

;(async () => {
  try {
    // Delete all collections first
    await UserService.deleteAllCollections()

    // Create some users
    await UserService.createUser("heartlive", {
      userId: "HL1001",
      name: "Atif",
      avatar: "https://cdn.example.com/atif.jpg",
    })
    await UserService.createUser("heartlive", {
      userId: "HL1002",
      name: "Ali Zafar",
      avatar: "https://cdn.example.com/ali.jpg",
    })
    await UserService.createUser("pencil", {
      userId: "PN2001",
      name: "John Pencil",
      avatar: "https://cdn.example.com/john.jpg",
    })

    // Wait for indexing
    await new Promise((r) => setTimeout(r, 1000))

    // Fetch users
    const user1 = await UserService.getUser("heartlive", "HL1001")
    console.log("Fetched HL1001:", user1)

    const user2 = await UserService.getUser("pencil", "PN2001")
    console.log("Fetched PN2001:", user2)

    // Typo-tolerant search
    const searchHL = await UserService.searchUser("heartlive", "Ateef")
    console.log("Typo search for Atif Asllam:", searchHL)

    // Update user
    const updated = await UserService.updateUser("heartlive", "HL1001", {
      name: "Atif Updated",
    })
    console.log("Updated HL1001:", updated)

    // Delete user
    await UserService.deleteUser("pencil", "PN2001")
    console.log("Deleted PN2001 from pencil collection")

    // Fetch after deletion (should return null)
    const userAfterDelete = await UserService.getUser("pencil", "PN2001")
    console.log("Fetched PN2001 after deletion:", userAfterDelete) // null
  } catch (err) {
    console.error(err)
  }
})()

module.exports = UserService
