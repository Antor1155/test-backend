// test-heartlive-progressive.js
const mongoose = require("mongoose")

// ============= SCHEMAS =============

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  beans: {
    type: Number,
    default: 0,
  },
  gems: {
    type: Number,
    default: 0,
  },
  isStarHost: {
    type: Boolean,
    default: false,
  },
  starHostStartDate: Date,
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Stream Schema
const streamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  weekNumber: Number,
  dayNumber: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Weekly Progress Schema
const weeklyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    weekStartDate: Date,
    weekEndDate: Date,
    isFirstWeek: {
      type: Boolean,
      default: false,
    },

    // First week tracking (with punishment system)
    dailyProgress: [
      {
        day: Number,
        hour1Completed: Boolean,
        hour2Completed: Boolean,
        totalMinutes: Number,
        isPresent: {
          type: Boolean,
          default: false,
        },
        isPunished: {
          type: Boolean,
          default: false,
        },
        dailyGemsEarned: {
          type: Number,
          default: 0,
        },
        rewardClaimDate: {
          type: Date,
          default: null,
        },
        rewardClaimedAmount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Punishment tracking for first week
    firstAbsentDay: {
      type: Number,
      default: null,
    },
    hasPunishment: {
      type: Boolean,
      default: false,
    },
    punishmentStartDay: {
      type: Number,
      default: null,
    },

    // Regular week tracking (weeks 2+)
    totalWeeklyMinutes: {
      type: Number,
      default: 0,
    },

    // Progressive milestones for weeks 2, 3, 4
    milestone10Hours: {
      type: Boolean,
      default: false,
    },
    milestone15Hours: {
      type: Boolean,
      default: false,
    },
    milestone20Hours: {
      type: Boolean,
      default: false,
    },

    // Monetary rewards (Week 1: daily, Week 2-4: milestone-based, Week 5+: none)
    gemsEarned: {
      type: Number,
      default: 0,
    },
    beansEarned: {
      type: Number,
      default: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
    rewardClaimDate: {
      type: Date,
      default: null,
    },
    rewardClaimedAmount: {
      type: Number,
      default: 0,
    },
    hasMonetaryRewards: {
      type: Boolean,
      default: function () {
        return this.weekNumber >= 1
      },
    },

    // Track which weeks have been started
    isStarted: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    weeklyPresentDayMinutes: {
      type: Number,
      default: 0,
    },
    weekDayForWeeklyTarget: {
      type: Number,
      default: 1,
    },
  },
  { collection: "weeklyprogress" },
)

// Agency Schema
const AgencySchema = new mongoose.Schema({
  username: String,
  email: String,
  starHosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  totalBeans: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create Models
const User = mongoose.model("User", userSchema)
const Stream = mongoose.model("Stream", streamSchema)
const WeeklyProgress = mongoose.model("WeeklyProgress", weeklyProgressSchema)
const Agency = mongoose.model("Agency", AgencySchema)

// ============= SERVICES =============

class StarHostService {
  async makeStarHost(userId, agency) {
    const session = await mongoose.startSession()
    session.startTransaction()
    const now = new Date()

    const utcToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        2,
        0,
        0,
        0,
      ),
    )

    try {
      //todo: startday is next day 00:00
      await User.findByIdAndUpdate(
        userId,
        {
          isStarHost: true,
          starHostStartDate: utcToday,
          agency: agency,
        },
        { session },
      )

      await Agency.findByIdAndUpdate(
        agency,
        {
          $addToSet: { starHosts: userId },
        },
        { session },
      )

      await this.createFirstWeekProgress(userId, session)

      await session.commitTransaction()
      return { success: true, message: "User made star host successfully" }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async createFirstWeekProgress(userId, session) {
    //todo: weekly progress should start next day 00:00
    const now = new Date()
    const utcToday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        2,
        0,
        0,
        0,
      ),
    )
    const weekStartDate = utcToday
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6)

    const dailyProgress = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      hour1Completed: false,
      hour2Completed: false,
      totalMinutes: 0,
      isPresent: false,
      isPunished: false,
      dailyGemsEarned: 0,
    }))

    await WeeklyProgress.create(
      [
        {
          userId,
          weekNumber: 1,
          weekStartDate,
          weekEndDate,
          isFirstWeek: true,
          hasMonetaryRewards: true,
          isStarted: true,
          dailyProgress,
        },
      ],
      { session },
    )
  }

  async getCurrentWeekInfo(userId) {
    const user = await User.findById(userId)
    if (!user || !user.isStarHost || !user.starHostStartDate) {
      return { error: "User is not a star host or missing start date" }
    }

    const startDate = user.starHostStartDate
    const now = new Date()

    const daysDiff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(daysDiff / 7) + 1
    const dayNumber = (daysDiff % 7) + 1

    const weekStartDate = new Date(startDate)
    weekStartDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7)

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    return {
      weekNumber,
      dayNumber,
      weekStartDate,
      weekEndDate,
      isFirstWeek: weekNumber === 1,
      hasMonetaryRewards: weekNumber >= 1,
      daysSinceStart: daysDiff,
    }
  }
}

class StreamService {
  async startStream(userId, streamId) {
    const user = await User.findById(userId)
    if (!user || !user.isStarHost) {
      return
    }

    const starHostService = new StarHostService()
    const weekInfo = await starHostService.getCurrentWeekInfo(userId)

    if (weekInfo.error) {
      throw new Error(weekInfo.error)
    }

    let stream

    if (streamId) {
      stream = await Stream.findById(streamId)

      if (!stream) {
        throw new Error("Stream not found")
      }
      stream.userId = userId
      stream.startTime = new Date()
      stream.weekNumber = weekInfo.weekNumber
      stream.dayNumber = weekInfo.dayNumber
    } else {
      stream = new Stream({
        userId,
        startTime: new Date(),
        weekNumber: weekInfo.weekNumber,
        dayNumber: weekInfo.dayNumber,
      })
    }

    return await stream.save()
  }

  async endStream(userId, streamId) {
    const user = await User.findById(userId)
    if (!user || !user.isStarHost) {
      return
    }

    const stream = await Stream.findById(streamId)
    if (!stream || stream.endTime) {
      throw new Error("Stream not found or already ended")
    }

    const endTime = new Date()
    const duration = Math.floor((endTime - stream.startTime) / (1000 * 60))

    stream.endTime = endTime
    stream.duration = duration
    stream.isActive = false

    await stream.save()
    await this.updateWeeklyProgress(
      stream.userId,
      stream.weekNumber,
      stream.dayNumber,
      duration,
    )

    return stream
  }

  async updateWeeklyProgress(userId, weekNumber, dayNumber, durationMinutes) {
    let progress = await WeeklyProgress.findOne({ userId, weekNumber })

    if (!progress && weekNumber > 1) {
      const starHostService = new StarHostService()
      const weekInfo = await starHostService.getCurrentWeekInfo(userId)

      progress = await WeeklyProgress.findOneAndUpdate(
        { userId, weekNumber },
        {
          userId,
          weekNumber,
          weekStartDate: weekInfo.weekStartDate,
          weekEndDate: weekInfo.weekEndDate,
          isFirstWeek: false,
          hasMonetaryRewards: true, // Weeks 2, 3, 4 have money, 5+ don't
          isStarted: true,
          totalWeeklyMinutes: 0,
          gemsEarned: 0,
          beansEarned: 0,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      ).exec()
      const moneyStatus = "WITH MONETARY REWARDS"
      console.log(
        `📅 Auto-created Week ${weekNumber} progress (${moneyStatus})`,
      )
    }

    if (progress.isFirstWeek) {
      await this.updateFirstWeekProgress(progress, dayNumber, durationMinutes)
    } else {
      await this.updateRegularWeekProgress(progress, dayNumber, durationMinutes)
    }
  }

  async updateFirstWeekProgress(progress, dayNumber, durationMinutes) {
    const dayIndex = dayNumber - 1
    const dayProgress = progress.dailyProgress[dayIndex]

    dayProgress.totalMinutes += durationMinutes
    progress.totalWeeklyMinutes += durationMinutes

    if (dayProgress.totalMinutes >= 60 && !dayProgress.isPresent) {
      dayProgress.isPresent = true
      console.log(
        `✅ Week 1 Day ${dayNumber} - PRESENT (${dayProgress.totalMinutes} minutes)`,
      )
    }

    await this.checkAbsenceAndApplyPunishment(progress, dayNumber)

    if (dayProgress.isPresent && !dayProgress.hour1Completed) {
      dayProgress.hour1Completed = true

      if (dayProgress.isPunished) {
        dayProgress.dailyGemsEarned = 10000
        progress.gemsEarned = this.recalculateWeeklyGems(progress)
        console.log(
          `🚫 Week 1 Day ${dayNumber} - PUNISHED! Gets only 10,000 gems`,
        )
      } else {
        dayProgress.dailyGemsEarned += 10000
        progress.gemsEarned = this.recalculateWeeklyGems(progress)
        console.log(
          `💰 Week 1 Day ${dayNumber} - Hour 1 completed! +10,000 gems`,
        )
      }
    }

    if (dayProgress.totalMinutes >= 120 && !dayProgress.hour2Completed) {
      dayProgress.hour2Completed = true

      if (dayProgress.isPunished) {
        console.log(
          `🚫 Week 1 Day ${dayNumber} - Hour 2 completed but PUNISHED!`,
        )
      } else {
        dayProgress.dailyGemsEarned += 25000
        progress.gemsEarned = this.recalculateWeeklyGems(progress)
        console.log(
          `💰 Week 1 Day ${dayNumber} - Hour 2 completed! +25,000 gems`,
        )
      }
    }

    await progress.save()
  }

  async updateRegularWeekProgress(progress, dayNumber, durationMinutes) {
    // logic to handle mx five hours per day on weekly progress
    let presentDayPreviousMinutes = progress.weeklyPresentDayMinutes
    const presentWeekDay = progress.weekDayForWeeklyTarget
    const dailyTargetHour = 5 * 60

    let todayActulaStreamMinutes = durationMinutes

    // if different day

    if (dayNumber !== presentWeekDay) {
      if (durationMinutes > dailyTargetHour) {
        todayActulaStreamMinutes = dailyTargetHour
      }

      progress.weekDayForWeeklyTarget = dayNumber
      progress.weeklyPresentDayMinutes = 0
      presentDayPreviousMinutes = 0
    }

    // when present day and 5 hour limit reached
    if (
      dayNumber === presentWeekDay &&
      presentDayPreviousMinutes >= dailyTargetHour
    ) {
      return
    }

    // when present day but 5 hour limit not reached
    if (
      dayNumber === presentWeekDay &&
      presentDayPreviousMinutes < dailyTargetHour
    ) {
      if (durationMinutes + presentDayPreviousMinutes > dailyTargetHour) {
        todayActulaStreamMinutes = dailyTargetHour - presentDayPreviousMinutes
      }
    }

    // upper part to handle max limit per day

    progress.totalWeeklyMinutes += todayActulaStreamMinutes
    progress.weeklyPresentDayMinutes += todayActulaStreamMinutes

    const totalHours = Math.floor(progress.totalWeeklyMinutes / 60)

    if (progress.weekNumber >= 2) {
      let gemsEarned = 0

      if (totalHours >= 20 && !progress.milestone20Hours) {
        progress.milestone20Hours = true
        gemsEarned += 100000
        progress.isCompleted = true
        console.log(
          `💰 Week ${progress.weekNumber} - 20 hours milestone! +100,000 gems EARNED!`,
        )
      }
      if (totalHours >= 15 && !progress.milestone15Hours) {
        progress.milestone15Hours = true
        gemsEarned += 50000
        progress.isCompleted = true
        console.log(
          `💰 Week ${progress.weekNumber} - 15 hours milestone! +50,000 gems EARNED!`,
        )
      }
      if (totalHours >= 10 && !progress.milestone10Hours) {
        progress.milestone10Hours = true
        gemsEarned += 100000
        progress.isCompleted = true
        console.log(
          `💰 Week ${progress.weekNumber} - 10 hours milestone! +100,000 gems EARNED!`,
        )
      }

      progress.gemsEarned = (progress.gemsEarned || 0) + gemsEarned
    }

    await progress.save()
  }

  recalculateWeeklyGems(progress) {
    return progress.dailyProgress.reduce(
      (total, day) => total + day.dailyGemsEarned,
      0,
    )
  }

  async checkAbsenceAndApplyPunishment(progress, currentDay) {
    if (progress.hasPunishment) return

    for (let day = 1; day < currentDay; day++) {
      const dayIndex = day - 1
      const dayData = progress.dailyProgress[dayIndex]

      if (dayData.totalMinutes < 60) {
        console.log(
          `⚠️  ABSENCE DETECTED on Week 1 Day ${day}! Applying punishment`,
        )

        progress.hasPunishment = true
        progress.firstAbsentDay = day
        progress.punishmentStartDay = day + 1

        for (let punishDay = day + 1; punishDay <= 7; punishDay++) {
          const punishIndex = punishDay - 1
          if (progress.dailyProgress[punishIndex]) {
            progress.dailyProgress[punishIndex].isPunished = true
          }
        }

        console.log(
          `🚫 Days ${day + 1}-7 get only 10,000 gems each (if present)`,
        )
        break
      }
    }
  }

  /*************  ✨ Windsurf Command 🌟  *************/
  /**
   * Claim daily rewards (Week 1) or weekly rewards (Weeks 2-4)
   * @param {ObjectId} userId User ID
   * @param {Number} weekNumber Week number
   * @returns {Object} { success: Boolean, weekNumber: Number, gemsEarned: Number, beansEarned: Number, message: String }
   */
  // Claim daily rewards (Week 1) or weekly rewards (Weeks 2-4)
  async claimWeeklyReward(userId, weekNumber) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const progress = await WeeklyProgress.findOne({
        userId,
        weekNumber: weekNumber,
      })

      if (!progress) {
        throw new Error(`Week ${weekNumber} not found or not started`)
      }

      if (!progress.hasMonetaryRewards) {
        throw new Error(`Week ${weekNumber} has no monetary rewards`)
      }

      if (!progress.isCompleted) {
        throw new Error(`Week ${weekNumber} not completed yet`)
      }

      if (progress.gemsEarned <= progress.rewardClaimedAmount) {
        throw new Error(`Week ${weekNumber} has no unclaimed rewards`)
      }

      // Calculate the amount of gems to claim now
      const hostRewardToClaimNow =
        progress.gemsEarned - progress.rewardClaimedAmount
      // Calculate the amount of beans to claim now (15% of gems)
      const agencyRewardToClaimNow = hostRewardToClaimNow * 0.15

      if (hostRewardToClaimNow > 0) {
        await User.findByIdAndUpdate(
          userId,
          {
            // Increment the user's gems by the amount to claim now
            $inc: { star_host_reward: hostRewardToClaimNow },
          },
          { session },
        )

        // Get the user with agency populated
        const user = await User.findById(userId).populate("agency")

        // If the user has an agency and the agency reward is greater than 0
        if (user.agency && agencyRewardToClaimNow > 0) {
          // Increment the agency's beans by the amount to claim now
          await Agency.findByIdAndUpdate(
            user.agency._id,
            {
              $inc: { totalBeans: agencyRewardToClaimNow },
            },
            { session },
          )
        }
      }

      // Update the progress with the new reward claim date and amount
      progress.rewardClaimDate = new Date()
      progress.rewardClaimedAmount += hostRewardToClaimNow
      progress.beansEarned += agencyRewardToClaimNow
      await progress.save({ session })

      await session.commitTransaction()

      return {
        success: true,
        weekNumber: weekNumber,
        gemsEarned: hostRewardToClaimNow,
        beansEarned: agencyRewardToClaimNow,
        message: `Week ${weekNumber} rewards claimed! ${hostRewardToClaimNow} gems earned`,
        amount: hostRewardToClaimNow,
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
  /*******  ebe3beaf-5220-43f4-a625-2387213f1ff3  *******/

  // Claim individual daily rewards for Week 1
  async claimDailyReward(userId, day) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
      const progress = await WeeklyProgress.findOne({
        userId,
        weekNumber: 1,
        isFirstWeek: true,
      })

      //! if week passed, can't claim
      const currentDate = new Date()
      const weekStartDate = new Date(progress.startDate)
      weekStartDate.setDate(
        weekStartDate.getDate() + (progress.weekNumber - 1) * 7,
      )
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekEndDate.getDate() + 7)

      if (currentDate > weekEndDate) {
        throw new Error("Week has 1already passed, can't claim rewards")
      }

      //!  upper part need to check

      if (!progress) {
        throw new Error("First week not found")
      }

      const dayProgress = progress.dailyProgress[day - 1]

      if (!dayProgress || !dayProgress.isPresent) {
        throw new Error("Day not present (need 60+ minutes)")
      }

      if (dayProgress.dailyGemsEarned <= dayProgress.rewardClaimedAmount) {
        throw new Error("Daily reward already claimed")
      }

      const hostRewardToClaimNow =
        dayProgress.dailyGemsEarned - dayProgress.rewardClaimedAmount
      const agencyRewardToClaimNow = hostRewardToClaimNow * 0.15

      await User.findByIdAndUpdate(
        userId,
        {
          $inc: { star_host_reward: hostRewardToClaimNow },
        },
        { session },
      )

      const user = await User.findById(userId).populate("agency")
      if (user.agency) {
        await Agency.findByIdAndUpdate(
          user.agency._id,
          {
            $inc: { totalBeans: agencyRewardToClaimNow },
          },
          { session },
        )
      }

      dayProgress.rewardClaimedAmount += hostRewardToClaimNow
      dayProgress.rewardClaimDate = currentDate

      progress.rewardClaimedAmount += hostRewardToClaimNow
      progress.beansEarned += agencyRewardToClaimNow
      progress.rewardClaimDate = currentDate

      await progress.save({ session })

      await session.commitTransaction()

      return {
        success: true,
        day: day,
        gemsEarned: hostRewardToClaimNow,
        beansEarned: agencyRewardToClaimNow,
        isPunished: dayProgress.isPunished,
        message: dayProgress.isPunished
          ? `Day ${day} claimed - PUNISHED (${hostRewardToClaimNow} gems)`
          : `Day ${day} claimed - NORMAL (${hostRewardToClaimNow} gems)`,

        amount: hostRewardToClaimNow,
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}

class RewardService {
  async getUserProgressSummary(userId) {
    const allProgress = await WeeklyProgress.find({ userId }).sort({
      weekNumber: 1,
    })
    const user = await User.findById(userId)

    const starHostService = new StarHostService()
    const currentWeekInfo = await starHostService.getCurrentWeekInfo(userId)

    const summary = {
      userId: userId,
      username: user.username,
      currentGemsBalance: user.gems,
      currentWeek: currentWeekInfo.weekNumber,
      totalWeeksTracked: allProgress.length,
      weeks: [],
    }

    // Add all weeks 1-7 (started and not started)
    for (let weekNum = 1; weekNum <= 7; weekNum++) {
      const weekData = allProgress.find((w) => w.weekNumber === weekNum)

      if (weekData) {
        // Week exists and has been started
        if (weekData.isFirstWeek) {
          summary.weeks.push({
            weekNumber: 1,
            type: "MONETARY_DAILY",
            status: "COMPLETED",
            daysPresent:
              weekData.dailyProgress?.filter((d) => d.isPresent).length || 0,
            hasPunishment: weekData.hasPunishment,
            firstAbsentDay: weekData.firstAbsentDay,
            totalGemsEarned: weekData.gemsEarned,
            isCompleted: weekData.isCompleted,
          })
        } else {
          // Regular weeks 2-7
          let weekType = "TRACKING_ONLY"
          let requiredHours = 0

          if (weekNum === 2) {
            weekType = "MONETARY_WEEKLY"
            requiredHours = 10
          } else if (weekNum === 3) {
            weekType = "MONETARY_WEEKLY"
            requiredHours = 15
          } else if (weekNum === 4) {
            weekType = "MONETARY_WEEKLY"
            requiredHours = 20
          }

          summary.weeks.push({
            weekNumber: weekNum,
            type: weekType,
            status: weekData.isCompleted ? "COMPLETED" : "IN_PROGRESS",
            totalHours: Math.floor(weekData.totalWeeklyMinutes / 60),
            requiredHours: requiredHours,
            milestones: {
              "10h": weekData.milestone10Hours,
              "15h": weekData.milestone15Hours,
              "20h": weekData.milestone20Hours,
            },
            gemsEarned: weekData.gemsEarned,
            isCompleted: weekData.isCompleted,
            hasMonetaryRewards: weekData.hasMonetaryRewards,
          })
        }
      } else {
        // Week doesn't exist - not started yet
        let weekType = "TRACKING_ONLY"
        let requiredHours = 0

        if (weekNum === 1) {
          weekType = "MONETARY_DAILY"
        } else if (weekNum === 2) {
          weekType = "MONETARY_WEEKLY"
          requiredHours = 10
        } else if (weekNum === 3) {
          weekType = "MONETARY_WEEKLY"
          requiredHours = 15
        } else if (weekNum === 4) {
          weekType = "MONETARY_WEEKLY"
          requiredHours = 20
        }

        summary.weeks.push({
          weekNumber: weekNum,
          type: weekType,
          status: "NOT_STARTED",
          totalHours: 0,
          requiredHours: requiredHours,
          gemsEarned: 0,
          isCompleted: false,
          hasMonetaryRewards: true,
        })
      }
    }

    return summary
  }
}

// ============= COMPREHENSIVE TEST FOR YOUR SCENARIO =============

async function testProgressiveScenario() {
  try {
    console.log("🚀 HEARTLIVE PROGRESSIVE SCENARIO TEST")
    console.log("=".repeat(80))
    console.log("📋 YOUR SPECIFIC SCENARIO:")
    console.log("   💰 Week 1: Completed with punishment")
    console.log("   💰 Week 2: Completed 10 hours → gets gems")
    console.log("   💰 Week 3: Completed 15 hours → gets gems")
    console.log("   💰 Week 4: Completed 20 hours → gets gems")
    console.log("   🔄 Week 5: Currently running (not started yet)")
    console.log("   ❌ Week 6-7: Not started yet\n")

    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://test-db:XYY9wuxkEdICobV8@cluster2.9uyxo.mongodb.net/heartlive_test",
      {},
    )
    console.log("✅ Connected to MongoDB\n")

    // Clear existing data
    await User.deleteMany({})
    await Agency.deleteMany({})
    await Stream.deleteMany({})
    await WeeklyProgress.deleteMany({})

    // Initialize services
    const starHostService = new StarHostService()
    const streamService = new StreamService()
    const rewardService = new RewardService()

    // Create Agency and user
    const agency = new Agency({
      username: "progressive_Agency",
      email: "Agency@test.com",
    })
    await agency.save()

    const user = new User({
      username: "progressive_host",
      email: "host@test.com",
    })
    await user.save()

    console.log("👥 Created Agency and user")
    await starHostService.makeStarHost(user._id, agency._id)
    console.log("⭐ Made user a star host\n")

    // =================== WEEK 1 - COMPLETED WITH PUNISHMENT ===================
    console.log("📅 WEEK 1 - COMPLETED WITH PUNISHMENT (Absent Day 3)")
    console.log("=".repeat(60))

    let currentUser = await User.findById(user._id)

    // Days 1-2: Normal
    for (let day = 1; day <= 2; day++) {
      console.log(`--- Week 1 Day ${day} (NORMAL) ---`)
      let stream = new Stream({
        userId: user._id,
        startTime: new Date(),
      })
      await stream.save()

      //todo: run it on stream start
      const stream1 = await streamService.startStream(user._id, stream._id)
      stream1.startTime = new Date(Date.now() - 60 * 60 * 1000)
      await stream1.save()

      //todo: run it on stream end
      await streamService.endStream(user._id, stream1._id)

      stream = new Stream({
        userId: user._id,
        startTime: new Date(),
      })
      await stream.save()

      const stream2 = await streamService.startStream(user._id, stream._id)
      stream2.startTime = new Date(Date.now() - 60 * 60 * 1000)
      await stream2.save()
      await streamService.endStream(user._id, stream2._id)

      const claim = await streamService.claimDailyReward(user._id, day)
      console.log(`💰 ${claim.message} → ${claim.gemsEarned} gems`)

      currentUser.starHostStartDate = new Date(
        currentUser.starHostStartDate.getTime() - 24 * 60 * 60 * 1000,
      )
      await currentUser.save()
      currentUser = await User.findById(user._id)
    }

    // Day 3: ABSENT
    let stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })

    await stream.save()
    console.log(`--- Week 1 Day 3 (ABSENT) ---`)
    const absentStream = await streamService.startStream(user._id, stream._id)
    absentStream.startTime = new Date(Date.now() - 40 * 60 * 1000) // Only 40 minutes
    await absentStream.save()
    await streamService.endStream(absentStream._id)

    console.log("❌ Day 3: Only 40 minutes → ABSENT → PUNISHMENT TRIGGERED")
    //! test was missing day 4 week 1
    // currentUser.starHostStartDate = new Date(
    //   currentUser.starHostStartDate.getTime() - 24 * 60 * 60 * 1000,
    // )
    // await currentUser.save()

    // Days 4-7: Present but punished
    for (let day = 4; day <= 7; day++) {
      console.log(`--- Week 1 Day ${day} (PUNISHED) ---`)
      let stream = new Stream({
        userId: user._id,
        startTime: new Date(),
      })
      await stream.save()

      currentUser = await User.findById(user._id)
      currentUser.starHostStartDate = new Date(
        currentUser.starHostStartDate.getTime() - 24 * 60 * 60 * 1000,
      )
      await currentUser.save()

      const stream1 = await streamService.startStream(user._id, stream._id)
      stream1.startTime = new Date(Date.now() - 60 * 60 * 1000)
      await stream1.save()
      await streamService.endStream(user._id, stream1._id)

      stream = new Stream({
        userId: user._id,
        startTime: new Date(),
      })
      await stream.save()

      const stream2 = await streamService.startStream(user._id, stream._id)
      stream2.startTime = new Date(Date.now() - 60 * 60 * 1000)
      await stream2.save()
      await streamService.endStream(user._id, stream2._id)

      const claim = await streamService.claimDailyReward(user._id, day)
      console.log(`🚫 ${claim.message} → ${claim.gemsEarned} gems`)
    }

    console.log("\n✅ Week 1 completed with punishment!")

    // =================== WEEK 2 - COMPLETED 10 HOURS ===================
    console.log("\n📅 WEEK 2 - COMPLETED 10 HOURS → GETS GEMS")
    console.log("=".repeat(50))

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    // same day 3 stream on week 2 1st day

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    const week21Stream = await streamService.startStream(user._id, stream._id)
    week21Stream.startTime = new Date(Date.now() - 4 * 60 * 60 * 1000) // Exactly 4 hours
    await week21Stream.save()
    await streamService.endStream(user._id, week21Stream._id)

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    const week2Stream2 = await streamService.startStream(user._id, stream._id)
    week2Stream2.startTime = new Date(Date.now() - 4 * 60 * 60 * 1000) // Exactly 4 hours
    await week2Stream2.save()
    await streamService.endStream(user._id, week2Stream2._id)

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    const week2Stream3 = await streamService.startStream(user._id, stream._id)
    week2Stream3.startTime = new Date(Date.now() - 4 * 60 * 60 * 1000) // Exactly 4 hours
    await week2Stream3.save()
    await streamService.endStream(user._id, week2Stream3._id)

    //todo: set to day 2 of week 1

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 8 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    let week22Stream = await streamService.startStream(user._id, stream._id)
    week22Stream.startTime = new Date(Date.now() - 47 * 60 * 1000) // Exactly 47 minutes
    await week22Stream.save()
    await streamService.endStream(user._id, week22Stream._id)

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    week22Stream = await streamService.startStream(user._id, stream._id)
    week22Stream.startTime = new Date(Date.now() - 5 * 60 * 60 * 1000) // Exactly 5 hours
    await week22Stream.save()
    await streamService.endStream(user._id, week22Stream._id)

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    week22Stream = await streamService.startStream(user._id, stream._id)
    week22Stream.startTime = new Date(Date.now() - 5 * 60 * 60 * 1000) // Exactly 5 hours
    await week22Stream.save()
    await streamService.endStream(user._id, week22Stream._id)

    //todo:  set to day 3 of week 1

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 9 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    const week23Stream = await streamService.startStream(user._id, stream._id)
    week23Stream.startTime = new Date(Date.now() - 3 * 60 * 60 * 1000) // Exactly 3 hours
    await week23Stream.save()
    await streamService.endStream(user._id, week23Stream._id)

    const week2Claim = await streamService.claimWeeklyReward(user._id, 2)
    console.log(`💰 ${week2Claim.message}`)

    return

    // =================== WEEK 3 - COMPLETED 15 HOURS ===================
    console.log("\n📅 WEEK 3 - COMPLETED 15 HOURS → GETS GEMS")
    console.log("=".repeat(50))

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    stream = new Stream({
      userId: user._id,
      startTime: new Date(),
    })
    await stream.save()

    const week3Stream = await streamService.startStream(user._id, stream._id)
    week3Stream.startTime = new Date(Date.now() - 15 * 60 * 60 * 1000) // Exactly 15 hours
    await week3Stream.save()
    await streamService.endStream(week3Stream._id)

    const week3Claim = await streamService.claimWeeklyReward(user._id, 3)
    console.log(`💰 ${week3Claim.message}`)

    // =================== WEEK 4 - COMPLETED 20 HOURS ===================
    console.log("\n📅 WEEK 4 - COMPLETED 20 HOURS → GETS GEMS")
    console.log("=".repeat(50))

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 22 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    const week4Stream = await streamService.startStream(user._id, stream._id)
    week4Stream.startTime = new Date(Date.now() - 20 * 60 * 60 * 1000) // Exactly 20 hours
    await week4Stream.save()
    await streamService.endStream(week4Stream._id)

    const week4Claim = await streamService.claimWeeklyReward(user._id, 4)
    console.log(`💰 ${week4Claim.message}`)

    // =================== WEEK 5 - CURRENTLY RUNNING ===================
    console.log("\n📅 WEEK 5 - CURRENTLY RUNNING (NOT STARTED YET)")
    console.log("=".repeat(50))

    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 29 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    const week5Stream = await streamService.startStream(user._id, stream._id)
    week5Stream.startTime = new Date(Date.now() - 20 * 60 * 60 * 1000) // Exactly 20 hours
    await week5Stream.save()
    await streamService.endStream(week5Stream._id)

    const week5Claim = await streamService.claimWeeklyReward(user._id, 5)
    console.log(`💰 ${week5Claim.message}`)

    // Set user to be in week 5 but don't start streaming
    currentUser = await User.findById(user._id)
    currentUser.starHostStartDate = new Date(
      Date.now() - 29 * 24 * 60 * 60 * 1000,
    )
    await currentUser.save()

    console.log(
      "🔄 Week 5: User is in this week but hasn't started streaming yet",
    )
    console.log("❌ Weeks 6-7: Not reached yet")

    // =================== COMPREHENSIVE SUMMARY ===================
    console.log("\n📊 COMPREHENSIVE SUMMARY")
    console.log("=".repeat(60))

    const summary = await rewardService.getUserProgressSummary(user._id)
    const finalUser = await User.findById(user._id)
    const finalAgency = await Agency.findById(Agency._id)

    console.log(`👤 User: ${summary.username}`)
    console.log(`🗓️  Current Week: ${summary.currentWeek}`)
    console.log(`💎 Total Gems Balance: ${finalUser.gems}`)
    console.log(`🫘 Agency Beans Balance: ${finalAgency.totalBeans}`)
    console.log(`📈 Weeks Tracked: ${summary.totalWeeksTracked}/7`)

    console.log("\n📋 WEEK-BY-WEEK BREAKDOWN:")
    console.log("=".repeat(40))

    summary.weeks.forEach((week) => {
      const statusIcon = {
        COMPLETED: "✅",
        IN_PROGRESS: "🔄",
        NOT_STARTED: "❌",
      }[week.status]

      console.log(`\n${statusIcon} Week ${week.weekNumber} (${week.type}):`)
      console.log(`   Status: ${week.status}`)

      if (week.weekNumber === 1 && week.status === "COMPLETED") {
        console.log(`   Days Present: ${week.daysPresent}/7`)
        console.log(
          `   Punishment: ${
            week.hasPunishment
              ? "🚫 YES (Day " + week.firstAbsentDay + ")"
              : "✅ NO"
          }`,
        )
      } else if (week.status === "COMPLETED" && week.totalHours) {
        console.log(
          `   Hours Streamed: ${week.totalHours}/${week.requiredHours}`,
        )
        console.log(`   Requirement Met: ✅`)
      } else if (week.status === "NOT_STARTED") {
        console.log(`   Required Hours: ${week.requiredHours || "N/A"}`)
      }

      console.log(`   Gems Earned: ${week.gemsEarned}`)
      console.log(`   Rewards Claimed: ${week.rewardClaimed ? "✅" : "❌"}`)
      console.log(`   Has Money: ${week.hasMonetaryRewards ? "💰" : "📊"}`)
    })

    console.log("\n💡 SCENARIO ANALYSIS:")
    console.log("====================")
    console.log("🏆 Week 1: 110,000 gems (70k normal days + 40k punished days)")
    console.log("💰 Week 2: 100,000 gems (10 hour completion)")
    console.log("💰 Week 3: 150,000 gems (15 hour completion)")
    console.log("💰 Week 4: 200,000 gems (20 hour completion)")
    console.log("🔄 Week 5: Currently running - no activity yet")
    console.log("❌ Week 6-7: Not started")
    console.log("")
    console.log("💎 Total Gems Earned: 560,000")
    console.log("📈 Progressive difficulty: 10h → 15h → 20h")
    console.log("🎯 User completed all monetary weeks successfully!")

    console.log("\n✅ PROGRESSIVE SCENARIO TEST COMPLETED!")

    mongoose.connection.close()
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    console.error("Stack:", error.stack)
    mongoose.connection.close()
  }
}

// ============= EXPORTS =============

module.exports = {
  User,
  Agency,
  Stream,
  WeeklyProgress,
  StarHostService,
  StreamService,
  RewardService,
  testProgressiveScenario,
}

// Run progressive scenario test
if (require.main === module) {
  testProgressiveScenario()
}
