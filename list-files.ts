import { client } from './lib/gemini';

async function main() {
  const stores = await client.fileSearchStores.list();

  for (const s of stores) {
    console.log('STORE:', s.name);

    const files = await client.fileSearchStores.listFiles({
      fileSearchStoreName: s.name,
    });

    for (const f of files) {
      console.log('  -', f.name, f.state);
    }
  }
}

main();
