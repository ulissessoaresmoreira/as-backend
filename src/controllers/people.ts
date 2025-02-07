import { RequestHandler } from "express";
import * as people from '../services/people';
import { z } from "zod";
import { decryptMatch } from "../utils/match";

export const getAll: RequestHandler = async (req, res) => {
  const {id_event, id_group} = req.params;
  const items = await  people.getAll({
    id_event: parseInt(id_event),
    id_group: parseInt(id_group)
  });
  if(items) {
    res.json({people: items});
    return;
  }
  res.json({error: "Ocorreu um erro!"});
}

export const getPerson: RequestHandler = async (req, res) => {
  const {id_event, id_group, id} = req.params;
    const personItem = await people.getOne({
      id_event: parseInt(id_event),
      id_group: parseInt(id_group),
      id: parseInt(id)
    });
    if(personItem){
      res.json({person: personItem});
      return;
    }
    res.json({error: "Ocorreu um erro!"});  
}


export const addPerson: RequestHandler = async (req, res) => {
  const {id_event, id_group} = req.params;
  const addPersonSchema = z.object({
    name: z.string(),
    phone: z.string().transform(val => val.replace(/\.|-/gm, '')),
    matched: z.string().optional(),
  });
  const body = addPersonSchema.safeParse(req.body);
  if(!body.success){
    res.json({error: "Dados inválidos!"});
    return;    
  };
  const newPerson = await people.add({
    ...body.data,
    id_event: parseInt(id_event),
    id_group: parseInt(id_group)
  });
  if(newPerson){
    res.status(201).json({person: newPerson});
    return;
  }
  res.json({error: "Ocorreu um erro!"});
}

export const updatePerson: RequestHandler = async (req, res) => {
  const {id, id_event, id_group} = req.params;
  const updatePersonSchema = z.object({
    name: z.string().optional(),
    phone: z.string().transform(val => val.replace(/\./gm, '')).optional(),
    matched: z.string().optional(),
  });
  const body = updatePersonSchema.safeParse(req.body);
  if (!body.success) {
    res.json({ error: "Dados inválidos!" });
    return;
  }  
    const updatedPerson = await people.update({      
      id: parseInt(id),
      id_event: parseInt(id_event),
      id_group: parseInt(id_group)      
    }, body.data);    
    
    if(updatedPerson){
      const personItem = await people.getOne({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group),        
      });
      res.json({person: personItem});
      return;
    }
    res.json({error: "Ocorreu um erro!"});
}


export const deletePerson: RequestHandler = async (req, res) => {
  const {id_event, id_group, id} = req.params;
  const deletedPerson = await people.remove({
    id_event: parseInt(id_event),
    id_group: parseInt(id_group),
    id: parseInt(id)
  });
  if(deletedPerson){
    res.json({person: deletedPerson});
  }
  res.json({error: "Ocorreu um erro!"});
}

      // ROTAS PUBLICAS 
// NESTA ROTA VOU RECEBER O ID DO EVENTO E O N° DE TELEFONE POR QUERY STRING, E VOU TENTAR E BUSCAR A PESSOA POR ESSE NÚMERO
export const searchPerson: RequestHandler = async (req, res) => {
  const {id_event} = req.params;

  const searchPersonSchema = z.object({
    phone: z.string().transform(val => val.replace(/\./gm, ''))
  });
  const query = searchPersonSchema.safeParse(req.query);
  if(!query.success) {
    res.json({error: "Dados inválidos!"});
    return;
  }

  const personItem = await people.getOne({
    id_event: parseInt(id_event),
    phone: query.data.phone
  });
  if(personItem && personItem.matched){
    const matchId = decryptMatch(personItem.matched);

    const personMatched = await people.getOne({
      id_event: parseInt(id_event),
      id: matchId
    });
    if(personMatched){
      res.json({
        person: {
          id: personItem.id,
          name: personItem.name
        },
        personMatched: {
          personMatched: personMatched.id,
          name: personMatched.name
        }
      });
      return;
    }
  }
  res.json({error: "Ocorreu um erro!"});
}