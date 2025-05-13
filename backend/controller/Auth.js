const express = require("express");
const User = require("../model/Users");
const cookieParser=require('cookie-parser')

// Signup Route
const signup =  async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful" });
    res.cookie("username",user.name,{
      httpOnly: true,
      sameSite: "strict",
      secure: process.NODE_ENV==="production",
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const logout=async(req,res)=>{
  res.clearcookie("username")
  res.status(200).json({message:"Logged out Successfully"})
}
module.exports = { signup, login,logout };