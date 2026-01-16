import express from "express"
import "dotenv/config"

// import routes
import authRoutes from "./routes/authRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"



const app = express()

app.use(express.json())


app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes);




const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`)
})
