import { RequestHandler } from "express";
import { z } from "zod";
import * as auth from '../services/auth';

export const login: RequestHandler = (req, res) => {
  const loginSchema = z.object({
    password: z.string(),
  })
  const body = loginSchema.safeParse(req.body);
  if(!body.success) {
    res.status(400).json({error: "Dados inválidos!"});
    return;
  }
  //VALIDAR A SENHA E GERAR O TOKEN
  if(!auth.validatePassword(body.data.password)) {
    res.status(403).json({error: "Acesso negado!"});
    return;
  } 
    res.json({token: auth.createToken()});      
}  

export const validate: RequestHandler = (req, res, next) => {
  if(!req.headers.authorization){
    console.log(req.headers);
    res.status(403).json({error: "Acesso negado!"});
    return;
  }

  const token = req.headers.authorization?.split(' ')[1];
  if(!token || !auth.validateToken(token)) {
    res.status(403).json({error: "Acesso negado!"});
    return;
  }
  next();
}

