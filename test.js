import axios from 'axios';
import qs from 'querystring';


const req = axios.create({
  baseURL: 'http://127.0.0.1:3000/',
  paramsSerializer: qs.stringify,
})

;(async () => {
  const matt = await inserPersonWithRelations()
  await fetchPeople()

  // await updatePerson(matt, { age: 41 })
  // await deletePerson(matt.children[0])

  // const isabella = await insertChildForPerson(matt, {
  //   firstName: 'Isabella',
  //   lastName: 'Damon',
  //   age: 13,
  // })

  // await insertChildForPerson(matt.parent, {
  //   firstName: 'Kyle',
  //   lastName: 'Damon',
  //   age: 52,
  // })

  // await fetchChildren(matt.parent)
  // await insertPetForPerson(isabella, { name: 'Chewy', species: 'hamster' })
  // await fetchPersonsHamsters(isabella)

  // const departed = await insertMovie({ name: 'The Departed' })
  // await addPersonToMovieAsActor(departed, matt)
  // await removePersonFromMovie(departed, matt)
})().catch((err) => {
  console.error('error:', err )
})

async function inserPersonWithRelations() {
  console.log(`
    ////////////////////////////////////////////////
    //       Insert a person with relations       //
    ////////////////////////////////////////////////
  `)

  const { data: map } = await req.post('rooms', {
    name: 'art',
    title: 'Art',
    description: 'Art Department',

    parent: {
      name: 'lobby',
      title: 'Lobby',
      description: 'The Path To Everywhere Else',
    },

    doors: [
      {
        name: 'portraits',
        title: 'Portraits',
        description: 'Where you can request a custom portrait',
      },
    ],
  })

  console.dir(map, { depth: null })
  return map
}

async function fetchPeople() {
  console.log(`
    ////////////////////////////////////////////////
    //      Fetch people using some filters       //
    ////////////////////////////////////////////////
  `)

  const { data: allPeople } = await req.get('rooms', {
    params: {
      //select: ['firstName', 'lastName'],
      // Fuzzy name search. This should match to all the Damons.
      //name: 'damo',
      //withMovieCount: true,
      withGraph: '[doors]',
    },
  })

  console.dir(allPeople, { depth: null })
}









async function updatePerson(person, patch) {
  console.log(`
    ////////////////////////////////////////////////
    //              Update a person               //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.patch(`persons/${person.id}`, patch)

  console.dir(data)
}

async function deletePerson(person) {
  console.log(`
    ////////////////////////////////////////////////
    //              Delete a person               //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.delete(`persons/${person.id}`)

  console.dir(data)
}

async function insertChildForPerson(person, child) {
  console.log(`
    ////////////////////////////////////////////////
    //          Add a child for a person          //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.post(`persons/${person.id}/children`, child)

  console.dir(data)
  return data
}

async function fetchChildren(person) {
  console.log(`
    ////////////////////////////////////////////////
    //          Fetch a person's children         //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.get(`persons/${person.id}/children`, {
    params: {
      actorInMovie: 'Good Will Hunting',
    },
  })

  console.dir(data)
}

async function insertPetForPerson(person, pet) {
  console.log(`
    ////////////////////////////////////////////////
    //           Add a pet for a person           //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.post(`persons/${person.id}/pets`, pet)

  console.dir(data)
}

async function fetchPersonsHamsters(person) {
  console.log(`
    ////////////////////////////////////////////////
    //           Fetch a person's pets            //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.get(`persons/${person.id}/pets`, {
    params: {
      species: 'hamster',
    },
  })

  console.dir(data)
}

async function insertMovie(movie) {
  console.log(`
    ////////////////////////////////////////////////
    //             Insert a new movie             //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.post(`movies`, movie)

  console.dir(data)
  return data
}

async function addPersonToMovieAsActor(movie, actor) {
  console.log(`
    ////////////////////////////////////////////////
    //        Connect a movie and an actor        //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.post(`movies/${movie.id}/actors/${actor.id}`)

  console.dir(data)
}

async function removePersonFromMovie(movie, actor) {
  console.log(`
    ////////////////////////////////////////////////
    //      Disconnect a movie and an actor       //
    ////////////////////////////////////////////////
  `)

  const { data } = await req.delete(`movies/${movie.id}/actors/${actor.id}`)

  console.dir(data)
}
