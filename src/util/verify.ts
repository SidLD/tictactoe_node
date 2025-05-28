/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

//functions
export const verifyToken = async (req: any, res: any, next: any) => {
    try {
        const token = await req.headers['x-access-token'].split(' ')[1];
        req.user = {};
        if(token){
            jwt.verify(token,`${process.env.JWT_SECRET}`, async (err: any, decoded: any) => {
                if(err) return res.json({
                    isLoggingIn: false,
                    message: "Failed to Authenticate",
                    err: err
                })
                req.user.id = decoded.id;
                req.user.firstName = decoded.firstName;
                req.user.lastName = decoded.lastName;
                req.user.role = decoded.role
                req.user.hospital = decoded.hospital
                next(); 
            })
        }else{
            res.status(406).json({message:"Token Not Acceptable"})
        }
    } catch {
        res.status(406).json({message:"Token Not Acceptable"})
    }
}

export const verifyAdmin  = async (req: any, res: any, next: any) => {
    try {
        const token = await req.headers['x-access-token'].split(' ')[1];
        req.user = {};
        if(token){
            jwt.verify(token,`${process.env.JWT_SECRET}`, async (err: any, decoded: any) => {
                if(err) return res.json({
                    isLoggingIn: false,
                    message: "Failed to Authenticate",
                    err: err
                })
                if(req.user.role == 'ADMIN'){      
                    req.user.id = decoded.id;
                    req.user.firstName = decoded.firstName;
                    req.user.lastName = decoded.lastName;
                    req.user.role = decoded.role
                    req.user.hospital = decoded.hospital
                    next(); 
                }
                return res.status(406).json({message:"You dont have enough credentials to run this operation"})
            })
        }else{
            res.status(406).json({message:"Token Not Acceptable"})
        }
    } catch {
        res.status(406).json({message:"Token Not Acceptable"})
    }
}