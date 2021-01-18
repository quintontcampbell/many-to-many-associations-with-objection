import express from "express"
import objection from "objection"

import { Club } from "../../../models/index.js"

const clubRouter = new express.Router()

clubRouter.get("/", async (req, res) => {
  try {
    const clubs = await Club.query()
    return res.status(200).json({ clubs: clubs })
  } catch(error){
    console.log(error)
    return res.status(500).json({ errors: error })
  }
})

clubRouter.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const club = await Club.query().findById(id)
    club.students = await club.$relatedQuery("students")
    return res.status(200).json({ club: club })
  } catch(error){
    return res.status(500).json({ errors: error })
  }
})

export default clubRouter