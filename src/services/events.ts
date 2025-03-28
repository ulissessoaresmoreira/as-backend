import { PrismaClient, Prisma } from "@prisma/client";
import * as people from './people';
import * as groups from './groups';
import { encryptMatch } from "../utils/match";

const prisma = new PrismaClient();


export const getAll = async () => {
  try {
    return await prisma.event.findMany();
  } catch (error) {
    return false;
  }
};

export const getOne = async (id: number) => {
  try {
    return await prisma.event.findFirst({where: {id}});
  } catch (error) {
    return false;
  }
}

type EventsCreateData = Prisma.Args<typeof prisma.event, 'create'>['data']
export const add = async (data: EventsCreateData) => {
  try {
    return await prisma.event.create({data});
  } catch (error) {
    return false;
  }
}


type EventUpdateData = Prisma.Args<typeof prisma.event, 'update'>['data']
export const update = async (id: number, data: EventUpdateData) => {
  try {
    return await prisma.event.update({where: {id}, data});
  } catch (error) {
    return false;
  }
}

export const remove = async (id:number) => {
  try {
    return await prisma.event.delete({where: {id}});
  } catch (error) {
    return false;
  }
}

export const doMatches = async (id: number): Promise<boolean> => {
  const eventItem = await prisma.event.findFirst({where: {id}, select: {grouped: true}});
  if(eventItem) {
    const peopleList = await people.getAll({id_event: id});
    if(peopleList){
      console.log(peopleList);
      let sortedList: {id: number, match: number}[] = [];
      let sortable: number[] = [];

      let attempts = 0;
      let maxAttempts = peopleList.length * 10;
      let keepTrying = true;
      while (keepTrying && attempts < maxAttempts) {
        keepTrying = false;
        attempts++;
        sortedList = [];
        sortable = peopleList.map(item => item.id);
        for (let i in peopleList){
          let sortableFiltered: number[] = sortable;
          if(eventItem.grouped){            
            sortableFiltered = sortable.filter(sortableItem => {
              let sortablePerson = peopleList.find(item => item.id === sortableItem);          
              return peopleList[i].id_group !== sortablePerson?.id_group;
              
            });
          }
          if(sortableFiltered.length === 0 || (sortableFiltered.length === 1 && peopleList[i].id === sortableFiltered[0])){
            
            keepTrying = true;
          } else {
            let sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
            while(sortableFiltered[sortedIndex] === peopleList[i].id){
              sortedIndex = Math.floor(Math.random() * sortableFiltered.length);
            }

            sortedList.push({
              id: peopleList[i].id, 
              match: sortableFiltered[sortedIndex]
            });
            sortable = sortable.filter(item => item !== sortableFiltered[sortedIndex]);

          }
        }
      }
      console.log(`ATTEMPTS: ${attempts}`);
      console.log(`MAX ATTEMPTS: ${maxAttempts}`);
      console.log(sortedList)


      if(attempts < maxAttempts){
        for (let i in sortedList){
          await people.update({
            id: sortedList[i].id,
            id_event: id,            
          }, {matched: encryptMatch(sortedList[i].match)});
          console.log(`Matched ${sortedList[i].id} with ${sortedList[i].match}`);
        }
        return true;
      }
    }
  };

  return false;
}