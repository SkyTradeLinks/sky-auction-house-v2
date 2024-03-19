"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_EDITION_DISTRIBUTOR_SET = exports.BUY_EDITION_V2_SET = void 0;
const SELL_OLD = [
    "46ZyF5RpsSYSa9ZgLJrHFXUKSXTht6BLNSRJqw4ZKUYpf7ArSozKdGAUhiLnPc1KAGuEwNCW1ScbwTQZt4J34hgM",
    "49DB6xaqPid2p5QREkibcCCNr8awZw85AbHJkLms9JrPjPfY1zRvmQcxKpRoHbqF6pc45jzp2YWQiCEgpjA233fd",
    "21F4ioob8Et12zNuWj738tDLuYaAgvUM3PB8wpqSLmjFnj72WRoTkBX5SFHkDGucCXFp7uDcZdY68nZgJXkGyS9V",
    "9D9dcW9xgdXDC5aTzs2Udgcjog4dpcPfsvJR6vijae7ZxjqsZkvMWjpZuhNkynqEPGauRR9mrRKexd1RjVqXgXL",
    "5bnGy8xwiHC5JGbghAQ9BvQBoCEJcmtyqP3TsjG24RtjeUhvAG6Jp4WiiE21ifdpqEaUVPBBPuLFK2eAtnmjkMMR",
];
const BUY_EDITION_V2_OLD = [
    "ubtMYerHBM6KGM39cXuhABCwB23EBeFZwR93CsermfYRF5tPU5GJ4rwiLZFDBnWuscwEoqncBy8yhv8MmAbGfCV",
    "3h7VViUtda8JB2aZmufuSGFEBQz4igckEMg1fZuWgCkS3tLqkM2bAQoGpPdjx2WP7H16ZiLs6DCNefYX3V5n1hTr",
    "wiGYy2Kkyz4PQW4ZEk9DhSLxkk65ctAQU8PyETF3Ta1FdA4QN7TjF56hytEZCFrY3RisB6nVqynHo9vpF5p8XdW",
    "3CMMqecNErNnwNUyxRR6RWnZwEMtEUakJnjxjoABNnj3gq8Bzu9WXkmSVUjGZGm581RiP8iU15PBmbMf2pbw7XqX",
    "4ZJyDSkpoviL5gLQVucKBrR6uAjtb4Y7nDi9cxi73kPnKc47Z2LbpYgX5fe8hv8fBUpFVS4UgU6aawEhvrqm66PH",
    "2zvjF86xHapt4iQYoXT5ucbSb6ph4k3xSQeqBBXGkprYcWNrKUiLr97X3QcFstan75sAAvbud1Fn2ePNczYr4kL3",
    "Kyc4D2KuC1Nf1ExyHk5faFnJvJnwfa1MJMRJXP7vBD6iGpFDMQfiPQsgo5FCTce6agDdi9c8po12XBYSBG4RkCu",
    "gX5REcLD1i6rtoQXnU6NCKNrH7Dpu1ovRESAGxEwQNSW17tvA3YKXtWhmV4A2QuCiVzfzCUagf9yQ7PUWtbGgLm",
    "VUa2Wm84nd4ZwroMX3V93BorkVSzoEV63k73qx9i5tB5kYiM6D4e7TfwRnRVdFZVpdTz8LSEmxy4nbxFPaXXSDV",
    "2ZhE8TsmNB8Yoq9rGsYxiehYdwg8n12D8PcRdzXud4zVdJ69A7jW9zWuojw1JFomSca3CTWsAJEJEXcT9yBT7yZJ",
    "5QiTiAZxWydiLHHf1brkZWJcpy37n8hWkSTyiJEZjcbZQYyyyENCoFHHWNHgm5yJ1SDkcrXdR4j5K63DnH9vqS6Q",
    "4SL81iVcHYHSLhm7baYzgLN78VdEG5DLoSwBcpxzQuHorgsEEhToqtNNz7ATES59aDTSh6oUwEZ4hyJ7JWnvcxWF",
    "5AH9MzrcZqAeBuZM8wg96MXtHFXXzLxKFBuSZ8uqN2rTpyxRH43rwUU1Ybt1M1RB5aEEZ49r5tPYs1Sr5QoKQ3Lt",
];
const BUY_EDITION_V2 = [
    "4rqvgq5J6mkJNWdT4Rg1A7VxUmHxqFqhMG374eB19YZbSbv3QK3RxfnaigTvEcPR6bEdMHyjSsg15hYQ5L2TBZc5",
    "oPBfR2HqgorqFGHzcoaGwpiZ7wPy8nqfHmgrQX88vtuqqYd4SbkWpJL27gJV5toQudtYECizcpvnf24BE9PZyaN",
    "SJuUng5BPMunnyvGE6mQN4tHVpgUUGe67F5HoWvQKqKWeWfbrxeSNPL8dxLgnN5CxJyyc7vrs6ARHkwaAJGU5z5",
    "5aXbTZrk66C6kbqxzzvWHPqiy9LKfHwyU7tb3VV9GFhANnD4NQSBnxCjowdyj7ytpmYu1nqZoCzwKKEB1WQeYKfY",
    "3UUqZPMTaTfxbpw5Hmy9RZs1HPds6u2YzrPatpMiniALE3R2bqF4aHRNvMDXjaMCHLZeLCAvo94xrQqZau5dF4cx",
    "cjdTV9wveYnbWN3MYDhbhMjcs5zvvyHBv5NaPeC9pS5QmZEhMZcPgWb8GMPDTbEd8hvnG9ibWKkta5BmihEnLnJ",
    "2rzn68A9t7MutfpMyC6gfyywwMAaAWCETi8DmsMKaNW7m6zy8fEKiUPmmY3fsW4zQVComEHPc6PAqY3aRXX46WWj",
    "5FaKPcb7qmyHqRw4gFumrNVhNDtu4GvjBurY5dBJW3sQYbYGWepGsvDcpmBL5jJgM9MgxHZTZ5VenYfeyMYJXx1o",
    "5gaN54VxZctFJt8Dkiuhr5kwv1SeGy2kAgcPAqpd1mi2DgikigDUwfbUcV4q9kV8BLjprPYiqDk4PKQoL23Qk98p",
    "5p83rFxtPkBXt3e5LvRyQKc4mzUG4m9xizBvLiT2gxBKPP4kdyqo6jXTPL6kjB6ZQcdRh9CwQCi8GP9i5TMAeeeZ",
    "4AeAADzSdEHtAJFru3VoieN1FbJ3MzbqBQ7mzbNcdochwUi7VtTs5XMuux5ksPPyN8sJVG1yfwiT4zHbBLgtrzgz",
    "2A6igDDfRXcxXBRp6BQ56qHwox1XDHwp4fCgAEFSzWsybbSHFT7xnZKoskGFj8ATqGLQRfG8UubPfK7NrMDcXwM2",
    "XH5N4ykZVTKkcCpiPVZAYBNiUyecWzdbXunLrUjSSXPPMKx5A3JPZgRuaVBGUQrqbSmUhFr522GYibpfCUZBA7t",
    "4mFx5Nst74DVYZAFAErksTZut1uUNrxYu6piVvmgvU9x9aG9F2rRnGeL3ghq41TgCSUm97UzZQ5ZPdr13W3z9zS4",
    "21NwVSZhdNuhr2E862J5Ne7drqHeJowRY9ArZp1TKVZ8DJz92kzQVEtks7CtMebzA5Yc2JBoxjBXNJJxj5PhhHQJ",
    "2rF2wwT3DszhAnDBWma79Va8FfqHN7yYDQ8Zv69zsFJ6aEB5ydeDZcUSgyfmyZQs2srtLNL1EnkSYYyUiSPWK7Ee",
    "2TqKtw8KkYEquNwDBbcw1qGDCbsJTw9GjBzXJ7mNjCd6pC2UhSeLSzfzvHR2TQsubTinto8JdHkmeQDq2QFMum7S",
    "2D1cbsyfWaqibHi6ew4K9UD727umyYPdgJgdXekQ9tQTsPV5HPr2rb2dMjsk8UKuoG3h1QA2rWmQrJ99zVeMHsak",
    "3JjxbXP9TAMkWVispjevo7q4zcgjPXQ63SQLoaL8L2ZLvhhkjrzKxjuQuzzrU3szsS28oyDWQzBFj2PAvDy8y73F",
];
exports.BUY_EDITION_V2_SET = new Set(BUY_EDITION_V2);
const EXECUTE_SALE_V2 = [
    "3MUnraQdQyeTZ3kQt5rRCcciozrHYax7FLCEGpRUYZPVp2Ja1PN2zL8L2wjdjFjjgoFVXU2LyyHeyMWvP8zXF4vp",
    "XM3rnySnveFyQSxt4jq67i8x7iU4BaGhRe8wz8HUQB8gX7i8xE7D1rLGNTRayUsvseDq9dTxdqeY4bPLLQxXzrd",
    "zeELnT4FuZUXGNHL95LzVyvPvsG9sQrtxp2R7gBoVdyBMrJn6vyNFEiduYJMn4UYcZZKss9y2quv27kCkfh6ZnB",
    "2PE5vByYhiU5nCL5gzmwRxJwm9iNQDzEgoXP5PuXXZRs9H4z74LKHZkg9CczJYvXykb2PWkB1eEEfUrBUm4qQvoi",
    "4cRPcf5sbk4n3dDGWkJv9duRpbR1kmd3w4UDHQVTDkfwDorwYsdPc1Lth4aCRqTwjNzeg28AKUBrC81KHhWGwRPh",
    "5LFDQNhZYoMZFBkudTg9CNTPhRJez9RWe2XC98uD9Lw5RTHGT2C415N21JUgj7sLcuUaTvLthxYa96ctJGvR7EwZ",
    "3Twr91XxJFtcaq7RytBTMJmXi4PPxgvZhKKq4KN6Apg4hCR2qtJv3Jadw42si3dEy3A93BTLy6UKnkYHfCA9fXzK",
    "2W4tvFebuU4BbocWGz8tFSVHbzBwoSunHS1EpGgvnQX4TPcL3Zxtx59WmZoYkkPw9dYx7SAKK6wNV51wMdRVMXbx",
    "2Uo7fKH95D1Z2374fcRRquhVQGkM1Y4GRnsVw1KMrDCnRjSL9ZEGArmjQqKMJv4oVHYvC5ER75qqxr1f5SucySkN",
];
const CREATE_EDITION_DISTRIBUTOR = [
    "3GTAvCGjziqVae4zys7Hq7kxZreppQfBpkMC2BMVwLpTnmEzwitKXFqDW9UKd3n7DEyk4gH2P2MojMM3rskjXpnE",
    "5AxppUDdJ1BCLJ18gjhqcTsBeoMadQ6BmG27KhtKuvMQaiLuSmrbHobWrvFD94ajVPD3FzdaC3RgmXuyEjsw5xmQ",
    "U4upwbzMHLECP53NctXCweq237PWtMtgHqdrSaRZQPedUu8RcCcwKf5MAYF4FX4p2twcHYxxjpgdrE6Mns9Pqbj",
    "4mVkUxQcHNH7RMUJgitvPQ7ZakkYjqDAKFEyRnrsu5MnFTFriBXfvecKSLdWbtNH6YHLADT7sWNVQ88JYgNhizD5",
    "26vK8XxfbMtCYi19u7XXxjCABhzpnpPyjEuQWEphnJvTZRd8XULPq6xiLgUjDjm8xsfAZRoMfyNd8ZvGgYQyq77t",
];
const CREATE_EDITION_DISTRIBUTOR_OLD = [
    "49uSiMDSpFtp8se2MZ5a1W1bvZiuPfRGQ8bKcYKWRCHyCP15ApjYGw6fz6Tud2aGiWcbNSKhbYhUbR9zqisHWhwa",
    "HRYu3rBSBkHoozpWi1qftZDCsSb2KP45ncZhvzp2GdEsjEnvC352yhPtfWFHaPY1ZMhbSW6jDwJ6LvCje1UbHoU",
    "2BUhim3JJEtFt8ehXUSTdn9qqyipKRbZLUviAwwxGapzbv9iABUniSACqRq7Mrw28YxzSFwRi4dtZxHbF2qf7Cyy",
];
const UPDATE_EDITION_DISTRIBUTOR = [
    "3Xxwnu8h66WsZgLAQjrzuLrsy16b64FH6F2aR9Jiz6xn1mkYCxSbETftZBtaEoS7exwD3oyDxXkCyKP2AaTCNT7H",
    "2kPH5FAS7dQEt79GsM77EDMXBFZL9DoKpXFmkJdTo6FKSCKGKzqUGDTuaiFSaKLh3n3suDY5o4jc646xjcKajVoE",
    "mtjjQ7XAVeYuh2Eg9kfnJdJxo4XoHr6VTjDFPGZfuMx5yvhiS83wVnfNhkxRDu5UHUKBWvra8sqTuAJWMFpVqfR",
    "y4tu3YmNjphBortKtXNohT6wLAvkGrgZvCfPsfyavpQEtsobkCHZRa1xESBtFvDRgpGHFsjAAMp8Dkp3cTcZ3M6",
    "uMungSRLQBUEykNitjtkN9Kjq3CMUgHcAgsp6xTFMGETQ6X5RrW9s2nq4UMGZmeqjknqyUsBZexZpgmJ4kBtXzq",
];
const CLOSE_EDITION_DISTRIBUTOR_TOKEN_ACCOUNT = [
    "4q5dvVpev3QwWEeJbVZN29rK9svkicK2WRW2dhYRyccj8Y54ZZQYpUoQ8CKcLyUU2u1g6276z3MyZVntTZ8LxAxX",
    "s5YEwzs8hJSgCqYgPTXmccsYgRYpqTSDA26YYkmtQsgDXU8EZPkWvqSdJNWbSWHBRa4YdFtRCp5Pn9xYZhxr9dn",
    "3uSgMCts4qygnBwyUrmRwxb4wdx4PVunNzpfu15gJhQ1vf74qLFSGevTcTkeJWW9HV9MrncVHhFbU1P5pi6JwQo2",
    "ziEFLJjWkidfHCPqBmH1u86F5yHxLXfcYnqn4AAKmarUrbbDwg9AcDqYwSW74qKuFJVq6CFQdyJeUnCAtrHnFYg",
    "5Y3goM5jbMVVh8XdcwHu7k9tDTDmig9KWYKBcpiZVY98JTUzPqeEnGr8LvbymcGUhtTQDFnttW3g1bdJY3K21dHC",
];
exports.CREATE_EDITION_DISTRIBUTOR_SET = new Set(CREATE_EDITION_DISTRIBUTOR);
const TEST_MAINNET_TXIDS = {
    BUY_EDITION_V2,
    BUY_EDITION_V2_OLD,
    CLOSE_EDITION_DISTRIBUTOR_TOKEN_ACCOUNT,
    CREATE_EDITION_DISTRIBUTOR,
    CREATE_EDITION_DISTRIBUTOR_OLD,
    EXECUTE_SALE_V2,
    SELL_OLD,
    UPDATE_EDITION_DISTRIBUTOR,
};
exports.default = TEST_MAINNET_TXIDS;
//# sourceMappingURL=TestMainnetTxids.js.map