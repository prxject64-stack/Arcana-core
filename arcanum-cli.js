#!/usr/bin/env node

import http from 'http';
import { URL } from 'url';

const BASE_URL = 'http://localhost:5000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(path, BASE_URL);
    http.get(fullUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log('Usage: ./arcanum-cli <command> [args]');
    console.log('');
    console.log('Commands:');
    console.log('  getmininginfo      Get current mining difficulty and hashrate');
    console.log('  getbalance         Get total coin supply (demo)');
    console.log('  getblocks          Get latest blocks');
    process.exit(0);
  }

  try {
    if (command === 'getmininginfo') {
      const stats = await makeRequest('/api/network/stats');
      console.log('Mining Info:');
      console.log(`  Difficulty: ${stats.difficulty}`);
      console.log(`  Hashrate: ${stats.hashrate}`);
      console.log(`  Block Height: ${stats.height}`);
      console.log(`  Network Supply: ${stats.supply} ARC`);
    } else if (command === 'getbalance') {
      const stats = await makeRequest('/api/network/stats');
      console.log(`Total Supply: ${stats.supply} ARC`);
    } else if (command === 'getblocks') {
      const blocks = await makeRequest('/api/blocks');
      console.log(`Latest ${Math.min(blocks.length, 5)} blocks:`);
      blocks.slice(0, 5).forEach((block) => {
        console.log(`  Height: ${block.height}, Hash: ${block.hash.substring(0, 16)}...`);
      });
    } else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Make sure the Arcana Coin server is running on port 5000');
    process.exit(1);
  }
}

main();
