import express from "express";
import User from "../models/user.model.js";
import validate from "../models/user.model.js";
import auth from '../middleware/auth.js';
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async(req,res) => {
    try {
        const{error} = validate(req.body);
        if (error)
            return res.status(400).send({message: error.details[0].message});

        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send({message: "User with given email already exists."});

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await new User({...req.body, password: hashPassword}).save();
        res.status(201).send({message: "User created successfully."});
    } catch (error) {
        res.status(500).send({message: "Internal server error."});
    }
});

router.get('/data', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({
            currency: user.currency,
            currentAvatar: user.currentAvatar,
            avatars: user.avatars,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ message: 'Internal server error.' });
    }
});

router.post("/update-currency", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        const { amount } = req.body;
        user.currency += amount;
        
        await user.save();

        res.status(200).send({ currency: user.currency, message: "Currency updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
});

router.post("/add-cat", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        const { newCat, currencyCost } = req.body;

        // Check if user has enough currency
        if (user.currency < currencyCost) {
            return res.status(400).send({ message: "Not enough currency" });
        }

        // Check if the cat is already owned
        if (user.avatars.includes(newCat)) {
            return res.status(400).send({ message: "Cat already owned" });
        }

        // Deduct currency and add new cat
        user.currency -= currencyCost;
        user.avatars.push(newCat);

        await user.save();

        res.status(200).send({
            currency: user.currency,
            ownedCats: user.avatars,
            message: `Successfully added new cat: ${newCat}`,
        });
    } catch (error) {
        console.error("Error adding new cat:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});

router.post("/select-avatar", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        const { avatar } = req.body;

        // Check if the avatar exists in the user's collection
        if (!user.avatars.includes(avatar)) {
            return res.status(400).send({ message: "Avatar not owned" });
        }

        // Update the current avatar
        user.currentAvatar = avatar;

        await user.save();

        res.status(200).send({
            currentAvatar: user.currentAvatar,
            message: `Avatar updated to: ${avatar}`,
        });
    } catch (error) {
        console.error("Error selecting avatar:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});


export default router;