import {Model} from 'objection';

import Room2 from './Room.js';

class Room extends Model {

  static get tableName() {
    return 'rooms'
  }






  static get relationMappings() {



    return {

      doors: {
        relation: Model.HasManyRelation,
        modelClass: Room2,
        join: {
          from: 'rooms.id',
          to: 'rooms.parentId',
        },
      },

      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room2,
        join: {
          from: 'rooms.parentId',
          to: 'rooms.id',
        },
      },

    }
  }

}

export default Room;
