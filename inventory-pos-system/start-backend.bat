@echo off
cd app\backend
npm install --legacy-peer-deps
npx prisma migrate deploy
node src\index.js
