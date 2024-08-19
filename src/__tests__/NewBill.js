/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/Store.js", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill form should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    test("Then file input change should trigger handleChangeFile", () => {
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

      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["file"], "file.png", { type: "image/png" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
  describe("When I am on the NewBill Page", () => {
    test("Then handleSubmit should be called when the form is submitted", () => {
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

      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

//test d'intégration POST

describe("Given I am connected as an employee on the NewBill page", () => {
  describe("When I submit form with valid data", () => {
    test("Then the bill should be successfully created", async () => {
      const htmlContent = NewBillUI();
      document.body.innerHTML = htmlContent;

      const navigateTo = (path) => {
        document.body.innerHTML = ROUTES({ path });
      };

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "example@email.com",
        })
      );

      const billInstance = new NewBill({
        document,
        onNavigate: navigateTo,
        store: null,
        localStorage: window.localStorage,
      });

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

      screen.getByTestId("expense-type").value = sampleBill.type;
      screen.getByTestId("expense-name").value = sampleBill.name;
      screen.getByTestId("datepicker").value = sampleBill.date;
      screen.getByTestId("amount").value = sampleBill.amount;
      screen.getByTestId("vat").value = sampleBill.vat;
      screen.getByTestId("pct").value = sampleBill.pct;
      screen.getByTestId("commentary").value = sampleBill.commentary;

      billInstance.fileName = sampleBill.fileName;
      billInstance.fileUrl = sampleBill.fileUrl;

      billInstance.updateBill = jest.fn();

      const formSubmission = jest.fn((e) => billInstance.handleSubmit(e));

      const formElement = screen.getByTestId("form-new-bill");
      formElement.addEventListener("submit", formSubmission);
      fireEvent.submit(formElement);

      expect(formSubmission).toHaveBeenCalled();
      expect(billInstance.updateBill).toHaveBeenCalled();
    });
  });
});
//test ligne 31-49
describe("Given I am connected as an employee on the NewBill page", () => {
  describe("When I change the file in the form", () => {
    let newBill;
    let mockEvent;
    let mockFile;
    let mockCreate;

    beforeEach(() => {
      // Initialisation du DOM
      document.body.innerHTML = `
       <div>
         <input data-testid="file" type="file" />
         <form data-testid="form-new-bill"></form>
       </div>
     `;
      //TODO: Check ici
      mockFile = new File(["dummy content"], "example.jpg", {
        type: "image/jpeg",
      });

      mockEvent = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\example.jpg",
          files: [mockFile],
        },
      };
      mockCreate = jest.fn().mockResolvedValue({
        fileUrl: "mockFileUrl",
        key: "mockKey",
      });
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
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: "test@example.com",
        })
      );
    });

    test("Then it should handle file change correctly", async () => {
      await newBill.handleChangeFile(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });
      expect(newBill.billId).toBe("mockKey");
      expect(newBill.fileUrl).toBe("mockFileUrl");
      expect(newBill.fileName).toBe("example.jpg");
    });

    test("Then it should alert on invalid file extension", () => {
      mockEvent.target.value = "C:\\fakepath\\example.txt";
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

      newBill.handleChangeFile(mockEvent);

      expect(alertSpy).toHaveBeenCalledWith(
        "Veuillez sélectionner un fichier avec une extension .jpg, .jpeg ou .png"
      );
    });
  });
});

describe("If there is an API error", () => {
  beforeEach(() => {
    // Reset the localStorage
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );

    // Spy on the mockStore
    jest.spyOn(mockStore, "bills");

    // Set up the DOM
    document.body.innerHTML = ""; // Clear the body to ensure a fresh state
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);

    // Initialize the router
    router();
  });

  test("fails with 404 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);

    // Check if the message is in the DOM
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);

    // Check if the message is in the DOM
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
