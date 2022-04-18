import Knex from "knex";
import knexConfig from '../../knexfile.js';

import Room from './models/Room.js';
import kebabCase from 'lodash/kebabCase.js'

import traverse from 'traverse';


import objection from 'objection';
const {Model, ForeignKeyViolationError, ValidationError} = objection;

export default function main({config, app, router, port}) {
  const knex = Knex(knexConfig.development)
  Model.knex(knex)


  router.post('/rooms', async (ctx) => {
     // insertGraph can run multiple queries. It's a good idea to
     // run it inside a transaction.
     const insertedGraph = await Room.transaction(async (trx) => {
       const insertedGraph = await Room.query(trx)
         // For security reasons, limit the relations that can be inserted.
         .allowGraph('[parent, doors]')
         .insertGraph(ctx.request.body, { allowRefs: true })
       return insertedGraph
     })

     // The children relation is from Person to Person. If we want to fetch the whole
     // descendant tree of a person we can just say "fetch this relation recursively"
     // using the `.^` notation.
     // console.log(
     //   people[0].children[0].children[0].children[0].children[0].firstName
     // );
     // const people = await Person.query().withGraphFetched('[pets, children.^]');


     ctx.body = insertedGraph
   })

  router.get('/rooms', async (ctx) => {
     const query = Room.query()

     if (ctx.query.select) {
       query.select(ctx.query.select)
     }

     if (ctx.query.name) {
       // The fuzzy name search has been defined as a reusable
       // modifier. See the room model.
       query.modify('searchByName', ctx.query.name)
     }

     if (ctx.query.withGraph) {
        query
          // For security reasons, limit the relations that can be fetched.
          .allowGraph('[parent, doors.^]')
          .withGraphFetched(ctx.query.withGraph)
      }

     if (ctx.query.orderBy) {
       query.orderBy(ctx.query.orderBy)
     }

     // You can uncomment the next line to see the SQL that gets executed.
     query.debug();

     ctx.body = await query
   })











   router.get("/build/:name", async(ctx) => {

    let user;

    if (ctx.isAuthenticated()) {
      user = ctx.session.passport.user;
    }


    if (ctx.params.name) {
      const roomName = kebabCase(ctx.params.name)
      const query = Room.query().where('name', roomName).withGraphFetched('[parent, doors.[]]')
      query.debug();
      const room = (await query).shift();

      await ctx.render("build", {
        title: config.site.name,
        user: user,
        room,
      });
    }

   });


    function getRoomAt(path, world){
      let target = null;

      let fragment = path.shift();
      console.log(fragment, path);

      for (const candidate of world.doors) {
        console.log('candidate.name == fragment:', candidate.name, fragment);
        if(candidate.name == fragment){

          if(path.length) {
            target = getRoomAt(path, candidate);
          }else{
            target = candidate;
          }

        }
      }


      return target;
    }


   router.get("/go/:path*", async(ctx) => {

    let user;

    if (ctx.isAuthenticated()) {
      user = ctx.session.passport.user;
    }


    if (ctx.params.path) {

      const path = ctx.params.path.split('/').map(i=>i.trim()).filter(i=>i).map(i=>kebabCase(i))


      const roomName = kebabCase(ctx.params.name)
      const query = Room.query().where('name', 'lobby').withGraphFetched('[parent, doors.^]')
      query.debug();
      const world = (await query).shift();

      // console.log(traverse(world).paths());

      const room = getRoomAt([...path], {doors:[world]});

      await ctx.render("room", {
        title: config.site.name,
        user: user,
        objects: [],
        room,
        path,
      });
    }

   });

return {}

}
