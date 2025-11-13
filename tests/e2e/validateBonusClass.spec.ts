import { quotation as test, expect } from "../fixtures/fixtureQuotation";
import { UserBonusClass } from "../enum/UserBonusClass";

test.describe('Validate Bonus Class', () => {
    test.describe('bonus class "Não" - hasBonus: false', () => {
        test.describe.configure({mode: 'serial'});

        test('Not use bonus class', async ({bonusesClass, hasBonus, page}) => {
            expect(hasBonus).toBe(false);
        });
    });

    test.describe('bonus class "Sim" - hasBonus: true', () => {
        test.describe.configure({mode: 'serial'});
        
        test.describe('with UserBonusClass.ONE', () => {
            test.use({hasBonus: true, userBonusClass: UserBonusClass.ONE});
            
            test('Use Bonus Class 1', async ({bonusesClass, hasBonus, userBonusClass, page}) => { 
                expect(hasBonus).toBe(true);
                expect(userBonusClass).toBe(UserBonusClass.ONE);
                
            });
        });
        
        test.describe('with UserBonusClass.NAN', () => {
            test.use({hasBonus: true, userBonusClass: UserBonusClass.NAN});
            
            test('Use Bonus Class NaN', async ({bonusesClass, hasBonus, userBonusClass, page}) => { 
                expect(hasBonus).toBe(true);
                expect(userBonusClass).toBe(UserBonusClass.NAN);
            });
        });
    });
});
    