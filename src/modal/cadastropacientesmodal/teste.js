
    {/* CPF com autocomplete */}
    <div className="col-span-2 relative">
      <label className="block text-sm font-medium">CPF*</label>
      <input
        type="text"
        name="guardian.cpf"
        value={form.guardian.cpf}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
      {showSuggestions && guardianSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded-lg shadow max-h-40 overflow-y-auto">
          {guardianSuggestions.map((g) => (
            <li
              key={g.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectGuardian(g)}
            >
              {g.cpf} - {g.name}
            </li>
          ))}
        </ul>
      )}
    </div>

  