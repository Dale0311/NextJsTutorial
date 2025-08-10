"use server";

import { z } from "zod";
import postgres from "postgres";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  values?: {
    customerId?: string;
    amount?: string;
    status?: "pending" | "paid";
  };
  message?: string | null;
};

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select customer", //if customerID is not string or undefined
  }),
  amount: z.coerce.number().gt(0, "Please enter an amount greater than $0"),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select status",
  }),
  date: z.string(),
});

// test
const FormSchema2 = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select customer", //if customerID is not string or undefined
  }),
  customerName: z.string({
    invalid_type_error: "Please select customer", //if customerName is not string or undefined
  }),
  amount: z.coerce.number().gt(0, "Please enter an amount greater than $0"),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select status",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  const rawData = {
    customerId: formData.get("customerId") as string,
    amount: formData.get("amount") as string,
    status: formData.get("status") as "pending" | "paid",
  };

  const validatedFields = CreateInvoice.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields, failed to create invoice",
      values: rawData,
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // insertion to the db
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const { amount, customerId, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const date = new Date().toISOString().split("T")[0];
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}, date = ${date}
    WHERE id = ${id}
  `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  throw new Error("Failed to Delete Invoice");
  if (!id) return console.log("ERROR: no id given");

  await sql`DELETE from invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
}

/* Steps in actions
 * 1. create a form schema
 * 2. get the data from form data/props
 * 3. parse the data to the schema
 * 4. insert it to the database
 * 5. revalidate path & redirect
 */
