export function up({schema}) {

  return schema

    .createTable('rooms', (table) => {

      table.increments('id').primary();

      table
        .integer('parentId')
        .unsigned()
        .references('id')
        .inTable('rooms')
        .onDelete('SET NULL')
        .index();

      table.string('name');
      table.string('title');
      table.string('description');

    });

}

export function down({schema}) {
  return schema
     .dropTableIfExists('rooms')
}
