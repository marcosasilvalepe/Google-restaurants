const puppeteer = require('puppeteer');
const main_url = "https://food.google.com/?ius=true&fo_m=EgwSAggCegYgASoCVVM&orderType=2&q&sei=CbPceXZpR3CSESP7-jBeMwbY&utm_campaign&utm_source=landing";
const fs = require('fs');

const writeToFile = (file, name) => {
    return new Promise((resolve, reject) => {
        fs.appendFile(file, `${name}\n`, error => {
            if (error) return reject(error);
            return resolve();
        })
    })
}

const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }

const goToGoogle = () => {
    return new Promise(async (resolve, reject) => {
        try {

            const browser = await puppeteer.launch({headless: false}); // default is true
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36');

            console.log(`Loading main site.`);
            await page.goto(main_url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            console.log('domcontentloaded')

            await page.waitForNavigation({ 
                waitUntil: 'networkidle2', 
                timeout: 45000 
            });

            console.log('finished waiting')

            /*
            await page.evaluate(async () => {
                        
                const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }                
                const btn = document.querySelector('div.tjRgS[role="button"]');

                const div_container = btn.parentElement.parentElement.parentElement;
                btn.click();
                await delay(500);

                const location_div = div_container.lastElementChild;
                while (!!location_div.querySelector('.BfG4I') === false) { console.log('waiting');await delay(50) }
                location_div.querySelector('.BfG4I').click();
            })


            
            await delay(1000);
            await page.focus('#qjD4af-5');
            await page.keyboard.type('Marcos');
            await page.keyboard.press('Tab');

            await page.keyboard.type('Washington Avenue 1261');
            await delay(1000);
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            await page.evaluate(async () => {
                await new Promise(async resolve => {
                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                    while (document.getElementById('qjD4af-7').value.length === 0) { await delay(300) }
                    return resolve();
                });
            });

            console.log('writing phone number');
            await page.focus('input[type="tel"]');
            await page.keyboard.type('+56968439779');
            await page.keyboard.press('Tab');

            console.log('writing email')
            await page.keyboard.type('somemail@gmail.com');
            await page.keyboard.press('Tab');
            await page.click('button[jsname="cSZ6pd"]');

            await page.evaluate(async () => {
                await new Promise(async resolve => {
                    const delay = ms => { return new Promise(resolve => { setTimeout(resolve, ms) }) }
                    while (document.querySelector('div[jsname="KFfxAf"]').style.display !== 'none') { await delay(250) }
                    await document.querySelector('button[aria-label="Close search"]').click();
                    return resolve();
                })
            })
            */

            const restaurants = [];
            let restaurant_ids = [];

            while (restaurants.length < 100) {

                console.log('inside')

                const check_more_restaurant_btn = async () => {
                    return await page.evaluate(async () => {
                        return new Promise(resolve => {
                            if (!!document.querySelector('button[aria-label="Show more restaurants"]')) return resolve(true);
                            return resolve(false);
                        })
                    })
                }

                const check_btn = await check_more_restaurant_btn();
                console.log(`More restaurants btn `, check_btn)
                if (check_btn) {
                    await page.evaluate(() => {
                        document.querySelector('button[aria-label="Show more restaurants"]').click();
                    });    
                } else break;
                
                //SHOW MORE RESTAURANTS

                await page.waitForNetworkIdle();
                console.log('finished getting more restaurants')

                const get_restaurants_ids = async () => {
                    return await page.evaluate(async () => {
                        return await new Promise(resolve => {
                            const ids_array = [];
                            document.querySelectorAll('div[aria-label="Restaurants"] > div').forEach(div => {
                                if (div.getAttribute('data-restaurant-id') !== null)
                                    ids_array.push(div.getAttribute('data-restaurant-id'));
                            });
                            console.log(ids_array)
                            return resolve(ids_array);
                        })
                    })
                }
                
                const current_index = restaurant_ids.length;
                restaurant_ids = await get_restaurants_ids();
                
                const loop = (page, current_index, restaurant_ids) => {
                    console.log(current_index, restaurant_ids);
                    return new Promise(async (resolve1, reject) => {
                        try {

                            for (let i = current_index; i < restaurant_ids.length; i++) {

                                console.log(i)
                
                                await page.waitForNetworkIdle();
                                await page.click(`div[data-restaurant-id="${restaurant_ids[i]}"] > div:first-child > div:first-child`);
                
                                console.log('waiting for navigation')
                                await page.waitForNetworkIdle();
                
                                const check_postmates = async () => {
                                    return await page.evaluate(async () => {
                                        return await new Promise(resolve => {
                                            if (!!document.querySelector('div[data-provider-id="11119966709964935892"]'))
                                                return resolve(true);
                                            else if (!!document.querySelector('div[data-provider-id="postmates.com"]'))
                                                return resolve(true)
                                            else return resolve(false);
                                        })
                                    })
                                }
                                
                                const postmates = await check_postmates();
                                console.log(postmates)
                
                                if (postmates) {
                
                                    const check_menu_type = async () => {
                                        return await page.evaluate(async () => {
                                            return new Promise(resolve => {
                                                if (!!document.querySelector('div[data-provider-id="11119966709964935892"]')) return resolve(false);
                                                else if (!!document.querySelector('div[data-provider-id="postmates.com"]')) return resolve(true)
                                            })
                                        })
                                    }
                
                                    const menu_in_new_tab = await check_menu_type();
                                    //NEW TAB FOR MENU
                
                                    //MENU IN SAME PAGE
                                    if (!menu_in_new_tab) {
                
                                        await page.waitForNetworkIdle();
                
                                        const get_li_length = async () => {
                                            return await page.evaluate(async () => {
                                                return await new Promise(resolve => {
                                                    return resolve(document.querySelectorAll('div[jsname="keqGdd"] > div > div:last-child > div:last-child > span > div').length);
                                                })
                                            })
                                        }
                                        
                                        const menu_length = await get_li_length();
                                        console.log(`menu length is: ${menu_length}`);
                                        for (let y = 0; y < menu_length; y++) {
                                            await page.click(`div[jsname="keqGdd"] > div > div:last-child > div:last-child > span > div:nth-child(${y + 1})`)
                                            await delay(50);
                                        }
                
                                        await page.waitForNetworkIdle();
                                        console.log('network idle after clicking on menu');
                
                                        const get_restaurant_name = async () => {
                                            return await page.evaluate(async () => {
                                                return await new Promise(resolve => {
                                                    return resolve(document.querySelector('div[jsname="lsTLQc"] h2').innerText);
                                                })
                                            })
                                        }
                
                                        const restaurant = {};
                                        restaurant.$oid = await get_restaurant_name()
                
                                        console.log(restaurant)
                
                                        const get_menu = async () => {
                                            return await page.evaluate(async () => {
                                                return await new Promise(resolve => {
                                                    const menu = [];
                                                    document.querySelectorAll('div.bBYIQb').forEach(category => {
                                                        
                                                        const obj = {
                                                            id: category.querySelector('div[data-section-id]').getAttribute('data-section-id').split('/')[1],
                                                            name: category.querySelector('div[data-section-id]').innerText,
                                                            active: true,
                                                            items: []
                                                        }
                        
                                                        category.querySelectorAll('div.dZ2Uyb').forEach(div => {
                                                            obj.items.push({
                                                                id: div.querySelector('div[data-menu-item-id]').getAttribute('data-menu-item-id').split('/')[1],
                                                                active: true,
                                                                image: (!!div.querySelector('img')) ? div.querySelector('img').src : null,
                                                                taxes: 0,
                                                                __v: 0,
                                                                name: div.querySelector('.S2Eeie').innerText,
                                                                title: div.querySelector('.S2Eeie').innerText,
                                                                price: div.querySelector('.IS0mV').innerText.replace('$',''),
                                                                description: div.querySelector('.eiW92e').innerText,
                                                                priceCurrency: "USD",
                                                                modifiers: [],
                                                                options: []
                                                            })
                                                        })
                        
                                                        menu.push(obj);
                                                    })
                                                    return resolve(menu);
                                                })
                                            });
                                        }
                
                                        restaurant.menu = await get_menu();
                                        restaurants.push(restaurant);
                                    }
                
                                } else console.log('Postmates not found in restaurant');
                
                                console.log(`finished ${i}`);
                                await page.evaluate(() => {
                                    document.getElementById('back_button').click();
                                });
                            }
                            return resolve1();

                        } catch(e) { return reject(e) }
                    })
                }
                
                await loop(page, current_index, restaurant_ids);

            }

            console.log(restaurants)
            await writeToFile('restaurants.json', JSON.stringify(restaurants))
            return resolve();

        } catch(error) { return reject(error) }
    })
}

(async () => {
    try {
        await goToGoogle();
    }
    catch(error) { console.log(error) }
    finally { process.exit() }
})();
