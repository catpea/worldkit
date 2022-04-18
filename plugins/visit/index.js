import Knex from "knex";
import knexConfig from '../../knexfile.js';

import Room from './models/Room.js';
import kebabCase from 'lodash/kebabCase.js'

import traverse from 'traverse';


import objection from 'objection';
const {Model, ForeignKeyViolationError, ValidationError} = objection;



export default function main({config, app, router, port}){
  const knex = Knex(knexConfig.development)
  Model.knex(knex)


  router.get("/v/:name", async(ctx) => {

    let user;
    if (ctx.isAuthenticated()) {
      user = ctx.session.passport.user;
    }else{
      // await ctx.redirect("/");
      // return;
    }

   if (!ctx.params.name) return;

     const roomName = kebabCase(ctx.params.name)
     const query = Room.query().where('name', roomName).withGraphFetched('[parent, doors.[]]')
     //query.debug();

     const rooms = await query;
     console.log('ROOMS>', rooms);

     if(!rooms.length){
       await ctx.render("message", {
         type: 'Problem',
         context: 'danger',
         name: 'Room Not Found',
         message: 'Room with that name is not in the system.',
       });
       return;
     }

     const room = rooms.shift();

     console.log('ROOM>', room);

     await ctx.render("build", {
       title: config.site.name,
       user: user,
       room,
     });


  });


  return {};

};
