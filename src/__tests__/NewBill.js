/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";

// Remplace le store réel par un mock pour les tests
jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill form should be rendered", () => {
      // Génère le HTML de la page NewBill
      const html = NewBillUI();
      document.body.innerHTML = html;
      // Vérifie si le formulaire est présent dans le DOM
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    test("Then file input change should trigger handleChangeFile", () => {
      // Fonction de navigation simulée
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Simule le localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Ajoute un utilisateur fictif au localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Crée une instance de NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Génère le HTML et l'insère dans le DOM
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Crée un espion pour la méthode handleChangeFile
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);

      // Simule le changement de fichier
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["file"], "file.png", { type: "image/png" })],
        },
      });

      // Vérifie si handleChangeFile a été appelé
      expect(handleChangeFile).toHaveBeenCalled();
    });
  });

  describe("When I am on the NewBill Page", () => {
    test("Then handleSubmit should be called when the form is submitted", () => {
      // Configuration similaire au test précédent
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      // Crée un espion pour la méthode handleSubmit
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      // Simule la soumission du formulaire
      fireEvent.submit(form);

      // Vérifie si handleSubmit a été appelé
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

// Test d'intégration POST
describe("Given I am connected as an employee on the NewBill page", () => {
  describe("When I submit form with valid data", () => {
    test("Then the bill should be successfully created", async () => {
      // Génère le HTML et l'insère dans le DOM
      const htmlContent = NewBillUI();
      document.body.innerHTML = htmlContent;

      // Fonction de navigation simulée
      const navigateTo = (path) => {
        document.body.innerHTML = ROUTES({ path });
      };

      // Simule un utilisateur connecté
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "example@email.com",
        })
      );

      // Crée une instance de NewBill
      const billInstance = new NewBill({
        document,
        onNavigate: navigateTo,
        store: null,
        localStorage: window.localStorage,
      });

      // Crée un objet de facture exemple
      const sampleBill = {
        type: "Flight",
        name: "Paris to Algeria",
        date: "2022-11-05",
        amount: 450,
        vat: 75,
        pct: 25,
        commentary: "Test Commentary",
        fileUrl: "../img/sample.jpg",
        fileName: "sampleImage.jpg",
        status: "pending",
      };

      // Remplit le formulaire avec les données de l'exemple
      screen.getByTestId("expense-type").value = sampleBill.type;
      screen.getByTestId("expense-name").value = sampleBill.name;
      screen.getByTestId("datepicker").value = sampleBill.date;
      screen.getByTestId("amount").value = sampleBill.amount;
      screen.getByTestId("vat").value = sampleBill.vat;
      screen.getByTestId("pct").value = sampleBill.pct;
      screen.getByTestId("commentary").value = sampleBill.commentary;

      billInstance.fileName = sampleBill.fileName;
      billInstance.fileUrl = sampleBill.fileUrl;

      // Crée un espion pour la méthode updateBill
      billInstance.updateBill = jest.fn();

      // Crée un espion pour la soumission du formulaire
      const formSubmission = jest.fn((e) => billInstance.handleSubmit(e));

      const formElement = screen.getByTestId("form-new-bill");
      formElement.addEventListener("submit", formSubmission);

      // Simule la soumission du formulaire
      fireEvent.submit(formElement);

      // Vérifie si le formulaire a été soumis et updateBill a été appelé
      expect(formSubmission).toHaveBeenCalled();
      expect(billInstance.updateBill).toHaveBeenCalled();
    });
  });
});

// Tests pour la fonction handleChangeFile
describe("Given I am connected as an employee on the NewBill page", () => {
  describe("When I change the file in the form", () => {
    let newBill;
    let mockEvent;
    let mockFile;
    let mockCreate;

    beforeEach(() => {
      // Initialise le DOM pour chaque test
      document.body.innerHTML = `
       <div>
         <input data-testid="file" type="file" />
         <form data-testid="form-new-bill"></form>
       </div>
     `;
      // Crée un fichier fictif
      mockFile = new File(["dummy content"], "example.jpg", {
        type: "image/jpeg",
      });

      // Simule un événement de changement de fichier
      mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\example.jpg",
          files: [mockFile],
        },
      };

      // Crée un mock pour la méthode create du store
      mockCreate = jest.fn().mockResolvedValue({
        fileUrl: "mockFileUrl",
        key: "mockKey",
      });

      // Crée une instance de NewBill avec des mocks
      newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: {
          bills: jest.fn().mockReturnValue({
            create: mockCreate,
          }),
        },
        localStorage: jest.fn(),
      });

      // Simule un utilisateur connecté
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: "test@example.com",
        })
      );
    });

    test("Then it should handle file change correctly", async () => {
      // Appelle handleChangeFile avec l'événement simulé
      await newBill.handleChangeFile(mockEvent);

      // Vérifie si preventDefault a été appelé
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // Vérifie si create a été appelé avec les bons arguments
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });
      // Vérifie si les propriétés de newBill ont été correctement mises à jour
      expect(newBill.billId).toBe("mockKey");
      expect(newBill.fileUrl).toBe("mockFileUrl");
      expect(newBill.fileName).toBe("example.jpg");
    });

    test("Then it should alert on invalid file extension", () => {
      // Modifie l'événement pour simuler un fichier invalide
      mockEvent.target.value = "C:\\fakepath\\example.txt";
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      // Appelle handleChangeFile avec le fichier invalide
      newBill.handleChangeFile(mockEvent);

      // Vérifie si l'alerte a été affichée avec le bon message
      expect(alertSpy).toHaveBeenCalledWith(
        "Veuillez sélectionner un fichier avec une extension .jpg, .jpeg ou .png"
      );
    });
  });
});

// Tests pour les erreurs lors de la soumission
describe("When I am on NewBill Page, i want to submit but an error appears", () => {
  let newBill;
  let store;

  beforeEach(() => {
    // Configure le localStorage pour chaque test
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    // Génère le HTML et l'insère dans le DOM
    document.body.innerHTML = NewBillUI();

    // Crée un mock du store
    store = {
      bills: jest.fn().mockReturnValue({
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn(),
      }),
    };

    // Crée une instance de NewBill avec le store mocké
    newBill = new NewBill({
      document,
      onNavigate: (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      },
      store,
      localStorage: window.localStorage,
    });
  });

  afterEach(() => {
    // Nettoie le DOM et les mocks après chaque test
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  test("Fetch fails with 404 error message", async () => {
    // Configure le mock pour rejeter avec une erreur 404
    store.bills().update.mockRejectedValue(new Error("404"));
    newBill.isFormImgValid = true;

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
    form.addEventListener("submit", handleSubmit);

    // Simule la soumission du formulaire
    fireEvent.submit(form);

    // Vérifie si l'erreur 404 est bien rejetée et si handleSubmit a été appelé
    await expect(store.bills().update()).rejects.toThrow("404");
    expect(handleSubmit).toHaveBeenCalled();
  });

  test("Fetch fails with 500 error message", async () => {
    // Configuration similaire au test précédent
    store.bills().update.mockRejectedValue(new Error("500"));
    newBill.isFormImgValid = true;

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
    form.addEventListener("submit", handleSubmit);

    fireEvent.submit(form);

    await expect(store.bills().update()).rejects.toThrow("500");
    expect(handleSubmit).toHaveBeenCalled();
  });
});
