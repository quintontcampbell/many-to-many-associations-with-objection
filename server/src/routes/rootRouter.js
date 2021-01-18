import express from "express"
import clientRouter from "./clientRouter.js"
const rootRouter = new express.Router()

import apiV1ClubRouter from "./api/v1/clubsRouter.js"

rootRouter.use("/api/v1/clubs", apiV1ClubRouter)
rootRouter.use("/", clientRouter)

export default rootRouter
