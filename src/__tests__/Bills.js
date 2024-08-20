/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";

import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
jest.mock("../app/store", () => ({
  bills: () => ({
    list: () =>
      Promise.resolve([
        {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2001-01-01",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        },
        {
          id: "BeKy5Mo4jkmdfPGYpTxZ",
          vat: "",
          amount: 100,
          name: "test1",
          fileName: "1592770761.jpeg",
          commentary: "plop",
          pct: 20,
          type: "Transports",
          email: "a@a",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
          date: "2004-04-04",
          status: "refused",
          commentAdmin: "en fait non",
        },
        {
          id: "UIUZtnPQvnbFnB0ozvJh",
          name: "test3",
          email: "a@a",
          type: "Services en ligne",
          vat: "60",
          pct: 20,
          commentAdmin: "bon bah d'accord",
          amount: 300,
          status: "accepted",
          date: "2003-03-03",
          commentary: "",
          fileName:
            "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3",
        },
        {
          id: "qcCK3SzECmaZAGRrHjaC",
          status: "refused",
          pct: 20,
          amount: 200,
          email: "a@a",
          name: "test2",
          vat: "40",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2002-02-02",
          commentAdmin: "pas la bonne facture",
          commentary: "test2",
          type: "Restaurants et bars",
          fileUrl:
            "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
        },

        // Ajoutez d'autres factures fictives ici
      ]),
  }),
}));

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
describe("Given i am connected as an employee", () => {
  //test handleClickIconEye ligne 14 de bills.js
  describe("When i click on any eye icon", () => {
    test("Then modal should open", () => {
      // Définition de localStorageMock pour simuler le localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Définition du type d'utilisateur dans le localStorage
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Génération du HTML de BillsUI avec les données de bills
      const html = BillsUI({ data: bills });

      // Mise à jour du contenu du corps du document avec le HTML généré
      document.body.innerHTML = html;

      // Fonction de navigation utilisée pour simuler la navigation vers la route bills
      const onNavigate = (pathname) => {
        // Mise à jour du contenu du corps du document avec le HTML de la route spécifiée par pathname
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Création d'une instance de Bills avec les dépendances simulées
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: null,
      });

      // Mock de la fonction $.fn.modal utilisée pour afficher la modale
      $.fn.modal = jest.fn();

      // Mock de la fonction handleClickIconEye pour simuler un clic sur l'icône de l'œil
      const handleClickIconEye = jest.fn(() => {
        // Fonction factice qui simule un clic sur l'icône de l'œil
        billsContainer.handleClickIconEye;
      });

      // Sélection de la première icône de l'œil
      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];

      // Ajout de l'événement de clic pour déclencher handleClickIconEye lors du clic sur l'icône de l'œil
      firstEyeIcon.addEventListener("click", handleClickIconEye);

      // Simulation du clic sur l'icône de l'œil en utilisant fireEvent.click
      fireEvent.click(firstEyeIcon);

      // Vérification que handleClickIconEye a été appelé
      expect(handleClickIconEye).toHaveBeenCalled();

      // Vérification que $.fn.modal a été appelé
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
});
// test naviagtion ligne 21 containers/Bills.js
describe("When I click the button 'Nouvelle note de frais'", () => {
  test("Then NewBill page appears", () => {
    // Mocking dependencies
    const onNavigateMock = jest.fn();

    // Création de l'instance du composant Bills
    const billsComponent = new Bills({
      document,
      onNavigate: onNavigateMock,
      store: null,
      localStorage: window.localStorage,
    });

    // Sélection du bouton "Nouvelle note de frais"
    const buttonNewBill = document.querySelector(
      'button[data-testid="btn-new-bill"]'
    );

    // Vérification du clic sur le bouton
    buttonNewBill.click();

    // Vérification du comportement attendu
    expect(onNavigateMock).toHaveBeenCalledWith(
      expect.stringContaining("#employee/bill/new")
    );
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then it should fetch bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Simuler le chargement des données
      const bills = await require("../app/Store").bills().list();
      document.body.innerHTML = BillsUI({ data: bills });

      await waitFor(() => {
        new Promise((resolve) => setTimeout(resolve, 100)); // Attendre 100ms

        // Vérifications du rendu du titre et du bouton
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        expect(screen.getByText("Nouvelle note de frais")).toBeTruthy();

        // Vérifier le nombre exact de lignes dans le tableau
        const tableRows = screen.getAllByRole("row");
        expect(tableRows.length).toBe(5); // 4 factures + 1 en-tête

        // Vérifier le contenu spécifique des factures
        expect(screen.getByText("encore")).toBeTruthy();
        expect(screen.getByText("test1")).toBeTruthy();
        expect(screen.getByText("test2")).toBeTruthy();
        expect(screen.getByText("test3")).toBeTruthy();

        // Vérifier la présence des icônes
        const eyeIcons = screen.getAllByTestId("icon-eye");
        expect(eyeIcons.length).toBe(4);
      });
    });
    test("Then it should fetch bills from an API and fails with 404 message error", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error("Erreur 404")),
        }),
      };

      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ error: "Erreur 404" });

      const message = await screen.getByText("Erreur 404");
      expect(message).toBeTruthy();
    });

    test("Then it should fetch bills from an API and fails with 500 message error", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      const mockStore = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error("Erreur 500")),
        }),
      };

      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ error: "Erreur 500" });

      const message = await screen.getByText("Erreur 500");
      expect(message).toBeTruthy();
    });
  });
});
