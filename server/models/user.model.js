import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    currency: {
        type: Number,
        default: 0,
    },
    currentAvatar: {
        type: String,
        default: "defaultCat.jpg",
    },
    avatars: {
        type: [String],
        default: ["defaultCat.jpg"],
    },
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        {_id: this._id},
        process.env.JWTPRIVATEKEY,
        {expiresIn: "7d"}
    );
    return token;
};

const User = mongoose.model('User', userSchema);

export const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        username: Joi.string().required().label("Username"),
        password: passwordComplexity.required().label("Password")
    })

    return schema.validate(data);
}

export default User;