import { decode, sign, verify } from 'hono/jwt'
import { Hono } from "hono";
import { signininput,signupinput } from '@rakeshpaulraj/medium-clone-types';
export const userrouter = new Hono<{Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
}}>();
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

userrouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
     datasourceUrl: c.env?.DATABASE_URL	,}).$extends(withAccelerate());
     const body = await c.req.json();
        const success=signupinput.safeParse(body); 
        if(!success.success){
            c.status(403);
            return c.json({error:"Invalid Input"});
        }
    
    try {
    const user = await prisma.user.create({
    data: {
    email: body.email,
    name:body.name,
    password: body.password,
    
    }
      });
     const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
     return c.json({ jwt });
     return c.text("Welcome!!");
    } catch(e) {
     c.status(403);
     return c.json({ error: "error while signing up" });
    }
     })

userrouter.post("/signin", async (c) => {
        const prisma = new PrismaClient({
          datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        const body = await c.req.json();
      try{
        const success=signininput.safeParse(body);
        if(!success){ 
          c.status(403);
            return c.json({error:"Invalid Input"});
        }
        const user = await prisma.user.findFirst({
          where: {
            email: body.email,
            password:body.password
          },
        });
        
        
        if (!user) {
          c.status(403);
          return c.json({ error: "Incorrect or User not found" });
        }
      
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });}
        catch(e){
          c.status(411);
          return c.text("Error on Signin")
        }
      })
      