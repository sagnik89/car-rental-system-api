import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
    res.json({msg:"get boookings route"})
})

router.post("/", (req, res) => {
    res.json({msg:"post bookings route"})
})

router.put("/:bookingId", (req, res) => {
    res.json({msg:"put booking route"})
})

router.delete("/:bookingId", (req, res) => {
    res.json({msg:"delete booking route"})
})


export default router