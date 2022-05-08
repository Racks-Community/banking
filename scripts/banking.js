require("dotenv").config();

const main = async () => {

    const mrcAddress = "0xef453154766505feb9dbf0a58e6990fd6eb66969";
    const MRC = await hre.ethers.getContractFactory("MRCRYPTO");
    const mrcContract = await MRC.attach(mrcAddress);
    const alchemyKey = process.env.ALCHEMY_KEY;

    //**** CONFIGURACIÓN */
    // Bloque de fin de la cuenta 
    const endBlockNumber = 28080713;
    
    // Total supply de Rackoins (lo he puesto en 10 millones para tests, repartiendo el 10%)
    const supplyRackoins = 10000000
    const porcentajeRepartir = 10
    //***** FIN CONFIGURACIÓN */

    // Crear un fork para revertir el estado de la cadena a la situación en el bloque final
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/" + alchemyKey,
            blockNumber: endBlockNumber,
          },
        },
      ],
    });

    // Bloque de inicio de la cuenta (bloque donde el reveal fue minado, no cambiar)
    const startBlockNumber = 28079352;
    if(endBlockNumber < startBlockNumber) throw "El bloque de fin es menor que el bloque de inicio";

    // Supply a repartir
    const supplyRepartir = supplyRackoins * porcentajeRepartir / 100;

    // Leer total supply
    // const supply = await mrcContract.totalSupply();
    const supply = 20; // Para pruebas

    // Aquí se almacenará el total de bloques holdeados por todos los holders, para calcular después la media
    totalBlocks = 0;

    // Aquí se irá almacenando la cuenta de bloques holdeados por cada holder
    holderBlocks = {};

    // Loop a todos los tokenIds
    for( var id = 1; id<=supply; id++ ){
      // Mostrar progreso
      console.clear();
      console.log("Procesando Mr Crypto %s", id);
      // Leer owner actual
      owner = await mrcContract.ownerOf(id);

      // Leer última transacción hacia el owner de este tokenid
      transfer = await mrcContract.queryFilter(mrcContract.filters.Transfer(null, owner, id));
      transfer = transfer[0];
      
      // Si el transfer se produjo antes del reveal, se cuenta solo el tiempo desde el reveal
      if(transfer.blockNumber < startBlockNumber){
        blockCount = endBlockNumber - startBlockNumber;
      }else{
        blockCount = endBlockNumber - transfer.blockNumber;
      }

      // Añadir la cuenta de estos bloques al total de bloques holdeados por los holders
      totalBlocks += blockCount;

      // Añadir este conteo de bloques a su owner
      if(holderBlocks[owner] == undefined){
        holderBlocks[owner] = blockCount;
      }else{
        holderBlocks[owner] = holderBlocks[owner] + blockCount
      }
    }

    console.clear();
    console.log("Creando archivo de resultado...")

    // Aquí se irá almacenando el supply que le corresponde a cada cartera
    holderAirdrop = {};

    for(holder in holderBlocks){
      holderAirdrop[holder] = holderBlocks[holder] / totalBlocks * supplyRepartir;
    }

    // Almacenar resultado
    var fs = require('fs');
    fs.writeFileSync("airdrop.txt", JSON.stringify(holderAirdrop), function(err) {
      if (err) {
        console.log(err);
      }
    });

    console.clear();
    console.log("Archivo creado correctamente")
    console.log(holderAirdrop);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();