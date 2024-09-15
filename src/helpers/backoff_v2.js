await backoff({
  maxAttempts: 2,
  initialDelay: 3000,
  maxDelay: 10000,
  onAttempt: (attempt, delay) => {
    console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms`)
    logs.push(`Attempt ${attempt} failed. Retrying in ${delay}ms`)
  },
  onRetry: (attempt, error) => {
    console.error(`Attempt ${attempt} failed. Reason: ${error.message}`)
    logs.push(`Attempt ${attempt} failed. Reason: ${error.message}`)
  },
  onMaxAttempts: () => {
    console.error("Task failed!")
    logs.push("Task failed!")
  },
  operation: async (attempt) => {
    prompt = quizScript({
      designation: batchExists.ai_property.designation,
      topics: topics?.join(", "),
      amount: 10,
      level: "easy",
      range: "minimum",
    })
    const response = await sendInputToChatgpt({
      prompt,
      temperature: 0.75,
      max_tokens: 11000,
      system: "create quiz for the given topics.",
    })

    ques = response.choices[0].message.content
    ques = eval(`${ques}`)
    if (!ques) {
      throw new Error("No questions generated!")
    }
    ques = ques.map((q) => {
      return {
        ...q,
        answers: _.shuffle(q.answers),
      }
    })

    if (!ques.length) {
      throw new Error("No questions generated!")
    }

    const data = await createChatGptInteraction({
      prompt,
      response: {
        quiz: ques,
      },
      engine: response.model,
      // assessed_by: req.user._id,
    })

    const newExam = await createExam({
      type: Exams.QUIZ,
      title: `Quiz On ${spExists.title}`,
      study_plan: spExists._id,
      batch: batchId,
      questions: ques,
      ai: data._id,
      submission_start_date: new Date(
        new Date(lastLiveDate).getTime() + 24 * 60 * 60 * 1000,
      ).toISOString(),
      last_submission_date: spExists.end_date,
      is_published: true,
      duration: 20,
    })

    if (!newExam) {
      throw new Error("Failed to create exam!")
    }

    await updateStudyPlan(
      {
        _id: spExists._id,
      },
      {
        $addToSet: {
          exams: newExam._id,
        },
      },
    )

    logs.push(`Successfully created quiz with id: ${newExam._id}`)
    logs.push(`Attempt ${attempt} succeeded with result: ${newExam._id}`)
    return newExam._id
  },
})
