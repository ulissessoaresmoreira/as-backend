import {PrismaClient, Prisma} from '@prisma/client';
import * as groups from './groups';

const prisma = new PrismaClient();

type GetAllFilters = {id_event: number, id_group?: number};
export const getAll = async (filters: GetAllFilters) => {
  try {
    return await prisma.eventPeople.findMany({where: filters});    
  } catch (error) {    
    return false
  }
}

type GetOneFilters = {id_event: number, id_group?: number, id?: number, phone?: string};
export const getOne = async (filters: GetOneFilters) => {
  try{
    if(!filters.id && !filters.phone) return false;
    return await prisma.eventPeople.findFirst({where: filters});
  } catch (error) {
    return false;
  }
}

type PersonCreateData = Prisma.Args<typeof prisma.eventPeople, 'create'>['data'];
export const add = async(data: PersonCreateData) =>{
  try{
    if(!data.id_group) return false;
    const group = await groups.getOne({ 
      id: data.id_group, 
      id_event: data.id_event 
    });
    if(!group) return false;
    return await prisma.eventPeople.create({data});
  } catch (error) {
    return false;
  }
}

type PeopleUpdateData = Prisma.Args<typeof prisma.eventPeople, 'update'>['data'];
type UpdateFilters = {id?: number, id_event: number, id_group?: number};
export const update = async(filters: UpdateFilters, data: PeopleUpdateData) => {
  try {
    if (!filters.id_event) return false;    
    return await prisma.eventPeople.updateMany({ where: filters, data }); 
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    return false;
  }
};


type DeletePersonFilters = {id_event?: number, id_group?: number, id: number}
export const remove = async (filters: DeletePersonFilters) => {
  try {
    if(!filters.id) return false;
    return await prisma.eventPeople.delete({where: filters});
  } catch (error) {
    return false;
  }
}