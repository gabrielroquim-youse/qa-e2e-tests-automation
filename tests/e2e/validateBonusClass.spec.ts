import { quotation as test, expect } from "../fixtures/fixtureQuotation";
import { UserBonusClass } from "../enum/UserBonusClass";

test.describe('Validate Bonus Class', () => {
    test.describe.configure({mode: 'serial'});

    test('Not use bonus class', async ({bonusesClass, hasBonus, page}) => {
        expect(hasBonus).toBe(false);
        
        const cardWhatsapp = {
            textWhatsapp: page.getByText('Quer ajuda para descobrir se você tem Classe de Bônus?'),
            buttonWhatsapp: page.getByRole('button',{name: 'Chame no whatsapp'})
        }
        
        expect(cardWhatsapp.textWhatsapp).toContainText('Quer ajuda para descobrir se você tem Classe de Bônus?')
        expect(cardWhatsapp.buttonWhatsapp).toHaveText('Chame no whatsapp')
    });
    
    test('Info dont know bonus class modal', async ({bonusesClass, page}) => {
        await bonusesClass.dontKnowBunusClass();

        const modalDontKnowBonusClass = {
            buttonWhatsapp: page.getByRole('button', {name: 'Chamar pelo WhatsApp', exact: true}),
            buttonContinue: page.getByRole('button', {name: 'continuar a cotação por aqui', exact: true})
        }

        expect(modalDontKnowBonusClass.buttonWhatsapp).toBeVisible();
        expect(modalDontKnowBonusClass.buttonContinue).toBeVisible();
    });

    test.describe('With Bonus Class 1', () => {
        test.use({hasBonus: true, userBonusClass: UserBonusClass.ONE});
        
        test('should validate Bonus Class 1 settings', async ({bonusesClass, hasBonus, userBonusClass}) => {
            expect(hasBonus).toBe(true);
            expect(userBonusClass).toBe(UserBonusClass.ONE);
        });
    });

    test.describe('With Bonus Class "Não quero informar"', () => {
        test.use({hasBonus: true, userBonusClass: UserBonusClass.NAN});
        
        test('should validate Bonus Class NAN settings', async ({bonusesClass, hasBonus, userBonusClass}) => {
            expect(hasBonus).toBe(true);
            expect(userBonusClass).toBe(UserBonusClass.NAN);
        });
    });

});
    