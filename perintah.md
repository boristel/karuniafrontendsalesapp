OK, SPK created running well, data posted to backend successfully (manually I check using admin dashboard).
i've update my backend struktur on SPK collectio, on root SPK collection I add :
"finish": boolean and "editable": boolean. The idea, on first create new SPK, finish will state "False" and "editable" will state "True". 
This 2 field can only change from admin using other application. 
Lets we continue to Dashboard SPK List Page
1. On Tab "On Progress",Load only SPK that finish = False and editable = True with filter sales_uid = sales_uid from localStorage.
2. On Tab "Finish" Load only SPK that finish = True and editable can be True or False with filter sales_uid = sales_uid from localStorage.
3. Column on table : 
    - "noSPK"
    - "namaCustomer"
    - "vehicleType"."name"
    - "tanggal"
    - "noTeleponCustomer"
    - "emailcustomer"
4. Add Action Button on table : 
    - "Edit" only with condition finish = False and editable = True.
    - "Print" -> we setup later. 
5. On Editing Page, create exact same form as Create SPK Page, different only using Method PUT. Don't forget to using documentId from SPK that we want to edit.
Make senses? Do think hard understandings and analysis reasoning and purposes with contexts above, then let me know your thoughts, so we are in the same page (thoughts) before continue with implementations!. Confirm me!