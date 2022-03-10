cd types
rm boomerdog-types-1.0.0.tgz

npm run build
npm pack

cp boomerdog-types-1.0.0.tgz ../server/
cp boomerdog-types-1.0.0.tgz ../client/
cd ../server && npm i boomerdog-types-1.0.0.tgz
cd ../client && npm i boomerdog-types-1.0.0.tgz

cd ..